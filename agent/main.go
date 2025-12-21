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
	Version = "0.3"

	// Nom de l'application
	AppName = "Mon Rempart Agent"

	// Intervalle entre les heartbeats (en secondes)
	HeartbeatInterval = 60 * time.Second

	// Intervalle entre les sauvegardes (pour les tests, plus court)
	BackupInterval = 5 * time.Minute
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

// LogPayload représente les données de log envoyées à l'API
type LogPayload struct {
	AgentID        string `json:"agent_id"`
	Hostname       string `json:"hostname"`
	Status         string `json:"status"` // success, failed, running
	Message        string `json:"message,omitempty"`
	BytesProcessed int64  `json:"bytes_processed"`
	FilesProcessed int    `json:"files_processed,omitempty"`
	Duration       int    `json:"duration_seconds,omitempty"`
}

// Agent global state
var (
	agentID  string
	hostname string
	cfg      *config.Config
)

func main() {
	var err error

	// Affichage du message de démarrage
	fmt.Printf("🛡️  Démarrage de l'agent %s v%s\n", AppName, Version)
	fmt.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

	// Chargement de la configuration
	cfg = config.LoadConfig()
	fmt.Printf("📁 Configuration chargée depuis: %s\n", cfg.ConfigPath)

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

	// Initialisation du système de sauvegarde
	resticWrapper := initBackupSystem()

	// Lancement de la sauvegarde initiale si Restic est disponible
	if resticWrapper != nil {
		go runInitialBackup(resticWrapper)
	}

	// Canal pour gérer l'arrêt propre
	stopChan := make(chan os.Signal, 1)
	signal.Notify(stopChan, syscall.SIGINT, syscall.SIGTERM)

	// Lancement de la boucle de heartbeat
	go heartbeatLoop()

	fmt.Println("\n🟢 Agent prêt. Ctrl+C pour arrêter.")

	// Attente du signal d'arrêt
	<-stopChan
	fmt.Println("\n\n🛑 Arrêt de l'agent demandé...")
	fmt.Println("👋 Agent Mon Rempart arrêté proprement.")
}

// initBackupSystem initialise le wrapper Restic
func initBackupSystem() *backup.ResticWrapper {
	fmt.Println("\n📦 Initialisation du système de sauvegarde...")

	// Configuration Restic depuis les variables d'environnement
	resticConfig := backup.ResticConfig{
		S3Endpoint:      cfg.S3Endpoint,
		S3Bucket:        cfg.S3Bucket,
		S3Path:          hostname, // Chaque machine a son propre chemin
		AccessKeyID:     cfg.S3AccessKey,
		SecretAccessKey: cfg.S3SecretKey,
		ResticPassword:  cfg.ResticPassword,
	}

	// Vérification de la configuration minimale
	if cfg.S3Bucket == "" || cfg.S3AccessKey == "" || cfg.ResticPassword == "" {
		fmt.Println("⚠️  Configuration S3/Restic incomplète - Mode simulation")
		fmt.Println("   Définissez les variables d'environnement suivantes:")
		fmt.Println("   - MONREMPART_S3_BUCKET")
		fmt.Println("   - MONREMPART_S3_ACCESS_KEY")
		fmt.Println("   - MONREMPART_S3_SECRET_KEY")
		fmt.Println("   - MONREMPART_RESTIC_PASSWORD")
		return nil
	}

	// Création du wrapper
	wrapper, err := backup.NewResticWrapper(resticConfig)
	if err != nil {
		fmt.Printf("⚠️  Restic non disponible: %v\n", err)
		fmt.Println("   Installez Restic: https://restic.net/")
		return nil
	}

	// Initialisation du dépôt
	if err := wrapper.InitRepo(); err != nil {
		fmt.Printf("❌ Échec initialisation dépôt: %v\n", err)
		sendLog("failed", fmt.Sprintf("Échec init repo: %v", err), 0, 0, 0)
		return nil
	}

	fmt.Println("✅ Système de sauvegarde prêt")
	return wrapper
}

// runInitialBackup lance la première sauvegarde
func runInitialBackup(wrapper *backup.ResticWrapper) {
	// Petit délai pour laisser le temps au heartbeat de s'enregistrer
	time.Sleep(2 * time.Second)

	fmt.Println("\n🔄 Lancement de la sauvegarde initiale...")

	// Création d'un dossier de test si nécessaire
	testDir := "./test_data"
	if _, err := os.Stat(testDir); os.IsNotExist(err) {
		os.MkdirAll(testDir, 0755)
		// Création d'un fichier de test
		testFile := testDir + "/test.txt"
		os.WriteFile(testFile, []byte("Mon Rempart - Fichier de test\n"+time.Now().String()), 0644)
		fmt.Printf("   📝 Dossier de test créé: %s\n", testDir)
	}

	// Exécution de la sauvegarde
	result, err := wrapper.RunBackup(testDir)
	if err != nil {
		fmt.Printf("❌ Échec sauvegarde: %v\n", err)
		sendLog("failed", err.Error(), 0, 0, 0)
		return
	}

	if result.Success {
		fmt.Println("✅ Sauvegarde initiale réussie!")
		sendLog("success",
			fmt.Sprintf("Snapshot %s créé", result.SnapshotID),
			result.BytesProcessed,
			result.FilesNew+result.FilesChanged,
			int(result.Duration),
		)

		// Affichage des snapshots
		snapshots, err := wrapper.GetSnapshots()
		if err == nil {
			fmt.Printf("\n📋 Snapshots dans le dépôt: %d\n", len(snapshots))
			for _, s := range snapshots {
				fmt.Printf("   • %s - %s\n", s.ShortID, s.Time.Format("02/01/2006 15:04"))
			}
		}
	}
}

// heartbeatLoop envoie des signaux de vie au Dashboard à intervalles réguliers
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
		fmt.Printf("[%s] 💓 Heartbeat OK - Commande: %s\n", timestamp, response.Command)

		// Mise à jour de l'agent_id si reçu
		if response.AgentID != "" {
			agentID = response.AgentID
		}

		// Traitement des commandes
		switch response.Command {
		case "backup_now":
			fmt.Printf("[%s] 📦 Commande de sauvegarde reçue!\n", timestamp)
		case "shutdown":
			fmt.Printf("[%s] 🛑 Arrêt demandé par le serveur\n", timestamp)
			os.Exit(0)
		}
	}

	return agentID
}

// sendLog envoie un log de sauvegarde à l'API
func sendLog(status, message string, bytesProcessed int64, filesProcessed, duration int) {
	timestamp := time.Now().Format("15:04:05")

	payload := LogPayload{
		AgentID:        agentID,
		Hostname:       hostname,
		Status:         status,
		Message:        message,
		BytesProcessed: bytesProcessed,
		FilesProcessed: filesProcessed,
		Duration:       duration,
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
		fmt.Printf("[%s] 📝 Log envoyé: %s\n", timestamp, status)
	} else {
		fmt.Printf("[%s] ⚠️  Erreur envoi log: %d\n", timestamp, resp.StatusCode)
	}
}
