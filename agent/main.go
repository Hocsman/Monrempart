// Package main - Agent Mon Rempart
// Agent de sauvegarde et cybersécurité pour les postes clients
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/mon-rempart/agent/backup"
	"github.com/mon-rempart/agent/config"
)

const (
	// Version de l'agent
	Version = "0.4"

	// Nom de l'application
	AppName = "Mon Rempart Agent"

	// Intervalle entre les heartbeats
	HeartbeatInterval = 60 * time.Second

	// Intervalle de vérification de la config
	ConfigCheckInterval = 60 * time.Second
)

// HeartbeatPayload représente les données envoyées au Dashboard
type HeartbeatPayload struct {
	Hostname  string `json:"hostname"`
	Status    string `json:"status"`
	IPAddress string `json:"ip_address,omitempty"`
}

// HeartbeatResponse représente la réponse du Dashboard
type HeartbeatResponse struct {
	Success bool   `json:"success"`
	Command string `json:"command"`
	Message string `json:"message,omitempty"`
	AgentID string `json:"agent_id,omitempty"`
}

// RemoteConfig représente la configuration reçue de l'API
type RemoteConfig struct {
	Success      bool   `json:"success"`
	Configured   bool   `json:"configured"`
	Endpoint     string `json:"endpoint,omitempty"`
	Bucket       string `json:"bucket,omitempty"`
	Region       string `json:"region,omitempty"`
	AccessKey    string `json:"accessKey,omitempty"`
	SecretKey    string `json:"secretKey,omitempty"`
	RepoPassword string `json:"repoPassword,omitempty"`
	Message      string `json:"message,omitempty"`
}

// LogPayload représente les données de log envoyées à l'API (backups)
type LogPayload struct {
	AgentID         string `json:"agent_id"`
	Hostname        string `json:"hostname"`
	Status          string `json:"status"`
	Message         string `json:"message,omitempty"`
	FilesNew        int    `json:"files_new,omitempty"`
	FilesChanged    int    `json:"files_changed,omitempty"`
	DataAdded       int64  `json:"data_added,omitempty"`
	DurationSeconds int    `json:"duration_seconds,omitempty"`
	LogType         string `json:"log_type,omitempty"`
}

// ActivityLogPayload représente les logs d'activité générale
type ActivityLogPayload struct {
	AgentID  string                 `json:"agent_id"`
	Hostname string                 `json:"hostname"`
	Level    string                 `json:"level"` // info, warning, error
	Message  string                 `json:"message"`
	Details  map[string]interface{} `json:"details,omitempty"`
	LogType  string                 `json:"log_type"`
}

// Agent global state
var (
	agentID       string
	hostname      string
	cfg           *config.Config
	remoteConfig  *RemoteConfig
	resticWrapper *backup.ResticWrapper
	configReady   = make(chan bool, 1)
)

func main() {
	var err error

	// Affichage du message de démarrage
	fmt.Printf("🛡️  Démarrage de l'agent %s v%s\n", AppName, Version)
	fmt.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

	// Chargement de la configuration locale
	cfg = config.LoadConfig()
	fmt.Printf("📁 Configuration locale: %s\n", cfg.ConfigPath)

	// Récupération du hostname
	hostname, err = os.Hostname()
	if err != nil {
		hostname = "inconnu"
		fmt.Printf("⚠️  Impossible de récupérer le hostname: %v\n", err)
	} else {
		fmt.Printf("💻 Hostname: %s\n", hostname)
	}

	fmt.Printf("🔗 API Dashboard: %s\n", cfg.APIEndpoint)
	fmt.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

	// Premier heartbeat pour récupérer l'agent_id
	agentID = sendHeartbeat()

	// Récupération de la configuration distante
	go configLoop()

	// Canal pour gérer l'arrêt propre
	stopChan := make(chan os.Signal, 1)
	signal.Notify(stopChan, syscall.SIGINT, syscall.SIGTERM)

	// Lancement de la boucle de heartbeat
	go heartbeatLoop()

	// Attente de la configuration puis lancement de la sauvegarde
	go func() {
		<-configReady
		runInitialBackup()
	}()

	fmt.Println("\n🟢 Agent prêt. Ctrl+C pour arrêter.")

	// Attente du signal d'arrêt
	<-stopChan
	fmt.Println("\n\n🛑 Arrêt de l'agent demandé...")
	fmt.Println("👋 Agent Mon Rempart arrêté proprement.")
}

// configLoop vérifie périodiquement la configuration distante
func configLoop() {
	// Première tentative immédiate
	if fetchRemoteConfig() {
		initBackupSystem()
		configReady <- true
	}

	ticker := time.NewTicker(ConfigCheckInterval)
	defer ticker.Stop()

	for range ticker.C {
		if remoteConfig == nil || !remoteConfig.Configured {
			if fetchRemoteConfig() {
				initBackupSystem()
				select {
				case configReady <- true:
				default:
				}
			}
		}
	}
}

// fetchRemoteConfig récupère la configuration depuis l'API
func fetchRemoteConfig() bool {
	timestamp := time.Now().Format("15:04:05")

	url := cfg.APIEndpoint + "/api/agent/config"
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		fmt.Printf("[%s] ❌ Erreur création requête config: %v\n", timestamp, err)
		return false
	}

	req.Header.Set("User-Agent", fmt.Sprintf("%s/%s", AppName, Version))

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Printf("[%s] ⚠️  Dashboard injoignable pour config: %v\n", timestamp, err)
		return false
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("[%s] ❌ Erreur lecture config: %v\n", timestamp, err)
		return false
	}

	var config RemoteConfig
	if err := json.Unmarshal(body, &config); err != nil {
		fmt.Printf("[%s] ❌ Erreur parsing config: %v\n", timestamp, err)
		return false
	}

	if !config.Success {
		fmt.Printf("[%s] ⚠️  Erreur API: %s\n", timestamp, config.Message)
		return false
	}

	if !config.Configured {
		fmt.Printf("[%s] ⏳ En attente de configuration... (%s)\n", timestamp, config.Message)
		fmt.Printf("[%s]    Configurez les paramètres S3 dans le Dashboard: %s/settings\n", timestamp, cfg.APIEndpoint)
		return false
	}

	remoteConfig = &config
	fmt.Printf("[%s] ✅ Configuration récupérée depuis le Dashboard\n", timestamp)
	fmt.Printf("   📦 Bucket: %s\n", config.Bucket)
	fmt.Printf("   🌍 Endpoint: %s\n", config.Endpoint)
	return true
}

// initBackupSystem initialise le wrapper Restic avec la config distante
func initBackupSystem() {
	if remoteConfig == nil || !remoteConfig.Configured {
		fmt.Println("⚠️  Configuration non disponible - sauvegarde désactivée")
		return
	}

	fmt.Println("\n📦 Initialisation du système de sauvegarde...")

	// Configuration Restic depuis la config distante
	resticConfig := backup.ResticConfig{
		S3Endpoint:      remoteConfig.Endpoint,
		S3Bucket:        remoteConfig.Bucket,
		S3Path:          hostname,
		AccessKeyID:     remoteConfig.AccessKey,
		SecretAccessKey: remoteConfig.SecretKey,
		ResticPassword:  remoteConfig.RepoPassword,
	}

	// Création du wrapper
	wrapper, err := backup.NewResticWrapper(resticConfig)
	if err != nil {
		fmt.Printf("⚠️  Restic non disponible: %v\n", err)
		fmt.Println("   Installez Restic: https://restic.net/")
		return
	}

	// Initialisation du dépôt
	if err := wrapper.InitRepo(); err != nil {
		fmt.Printf("❌ Échec initialisation dépôt: %v\n", err)
		sendLog("failed", fmt.Sprintf("Échec init repo: %v", err), 0, 0, 0, 0)
		return
	}

	resticWrapper = wrapper
	fmt.Println("✅ Système de sauvegarde prêt")
}

// runInitialBackup lance la première sauvegarde
func runInitialBackup() {
	if resticWrapper == nil {
		fmt.Println("⚠️  Wrapper Restic non initialisé - sauvegarde ignorée")
		return
	}

	// Petit délai
	time.Sleep(2 * time.Second)

	fmt.Println("\n🔄 Lancement de la sauvegarde initiale...")

	// Création d'un dossier de test
	testDir := "./test_data"
	if _, err := os.Stat(testDir); os.IsNotExist(err) {
		os.MkdirAll(testDir, 0755)
		testFile := testDir + "/test.txt"
		os.WriteFile(testFile, []byte("Mon Rempart - Fichier de test\n"+time.Now().String()), 0644)
		fmt.Printf("   📝 Dossier de test créé: %s\n", testDir)
	}

	// Exécution de la sauvegarde
	result, err := resticWrapper.RunBackup(testDir)
	if err != nil {
		fmt.Printf("❌ Échec sauvegarde: %v\n", err)
		sendLog("failed", err.Error(), 0, 0, 0, 0)
		return
	}

	if result.Success {
		fmt.Println("✅ Sauvegarde initiale réussie!")
		sendLog("success",
			fmt.Sprintf("Snapshot %s créé", result.SnapshotID),
			result.BytesProcessed,
			result.FilesNew,
			result.FilesChanged,
			int(result.Duration),
		)

		// Affichage des snapshots
		snapshots, err := resticWrapper.GetSnapshots()
		if err == nil {
			fmt.Printf("\n📋 Snapshots dans le dépôt: %d\n", len(snapshots))
			for _, s := range snapshots {
				fmt.Printf("   • %s - %s\n", s.ShortID, s.Time.Format("02/01/2006 15:04"))
			}
		}
	}
}

// heartbeatLoop envoie des signaux de vie
func heartbeatLoop() {
	ticker := time.NewTicker(HeartbeatInterval)
	defer ticker.Stop()

	for range ticker.C {
		sendHeartbeat()
	}
}

// sendHeartbeat envoie un signal de vie au Dashboard
func sendHeartbeat() string {
	timestamp := time.Now().Format("15:04:05")

	payload := HeartbeatPayload{
		Hostname: hostname,
		Status:   "online",
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		fmt.Printf("[%s] ❌ Erreur sérialisation: %v\n", timestamp, err)
		return agentID
	}

	url := cfg.APIEndpoint + "/api/agent/heartbeat"
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Printf("[%s] ❌ Erreur création requête: %v\n", timestamp, err)
		return agentID
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", fmt.Sprintf("%s/%s", AppName, Version))

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Printf("[%s] ⚠️  Dashboard injoignable: %v\n", timestamp, err)
		return agentID
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	var response HeartbeatResponse
	if err := json.Unmarshal(body, &response); err != nil {
		fmt.Printf("[%s] ❌ Erreur parsing réponse: %v\n", timestamp, err)
		return agentID
	}

	if response.Success {
		fmt.Printf("[%s] 💓 Heartbeat OK\n", timestamp)

		if response.AgentID != "" {
			agentID = response.AgentID
		}

		switch response.Command {
		case "backup_now":
			fmt.Printf("[%s] 📦 Commande de sauvegarde reçue!\n", timestamp)
			go runInitialBackup()
		case "shutdown":
			fmt.Printf("[%s] 🛑 Arrêt demandé par le serveur\n", timestamp)
			os.Exit(0)
		}
	}

	return agentID
}

// sendLog envoie un log de sauvegarde à l'API
func sendLog(status, message string, bytesProcessed int64, filesNew, filesChanged, duration int) {
	timestamp := time.Now().Format("15:04:05")

	payload := LogPayload{
		AgentID:         agentID,
		Hostname:        hostname,
		Status:          status,
		Message:         message,
		FilesNew:        filesNew,
		FilesChanged:    filesChanged,
		DataAdded:       bytesProcessed,
		DurationSeconds: duration,
		LogType:         "backup",
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		fmt.Printf("[%s] ❌ Erreur sérialisation log: %v\n", timestamp, err)
		return
	}

	url := cfg.APIEndpoint + "/api/agent/log"
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Printf("[%s] ❌ Erreur création requête log: %v\n", timestamp, err)
		return
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", fmt.Sprintf("%s/%s", AppName, Version))

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Printf("[%s] ⚠️  Impossible d'envoyer le log: %v\n", timestamp, err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK || resp.StatusCode == http.StatusCreated {
		fmt.Printf("[%s] 📝 Log backup envoyé: %s\n", timestamp, status)
	} else {
		fmt.Printf("[%s] ⚠️  Erreur envoi log: %d\n", timestamp, resp.StatusCode)
	}
}

// sendActivityLog envoie un log d'activité générale à l'API
func sendActivityLog(level, message string, details map[string]interface{}) {
	timestamp := time.Now().Format("15:04:05")

	payload := ActivityLogPayload{
		AgentID:  agentID,
		Hostname: hostname,
		Level:    level,
		Message:  message,
		Details:  details,
		LogType:  "activity",
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		fmt.Printf("[%s] ❌ Erreur sérialisation activity log: %v\n", timestamp, err)
		return
	}

	url := cfg.APIEndpoint + "/api/agent/log"
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Printf("[%s] ❌ Erreur création requête activity log: %v\n", timestamp, err)
		return
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", fmt.Sprintf("%s/%s", AppName, Version))

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Printf("[%s] ⚠️  Impossible d'envoyer l'activity log: %v\n", timestamp, err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK || resp.StatusCode == http.StatusCreated {
		fmt.Printf("[%s] 📋 Activity log envoyé: [%s] %s\n", timestamp, level, message)
	}
}

