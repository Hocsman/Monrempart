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
	"os/exec"
	"os/signal"
	"syscall"
	"time"

	"github.com/mon-rempart/agent/config"
)

const (
	// Version de l'agent
	Version = "0.2"

	// Nom de l'application
	AppName = "Mon Rempart Agent"

	// Intervalle entre les heartbeats (en secondes)
	HeartbeatInterval = 60 * time.Second
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
	Command string `json:"command"` // idle, backup_now, update, shutdown
	Message string `json:"message,omitempty"`
	AgentID string `json:"agent_id,omitempty"`
}

func main() {
	// Affichage du message de démarrage
	fmt.Printf("🛡️  Démarrage de l'agent %s v%s\n", AppName, Version)
	fmt.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

	// Chargement de la configuration
	cfg := config.LoadConfig()
	fmt.Printf("📁 Configuration chargée depuis: %s\n", cfg.ConfigPath)

	// Récupération du hostname
	hostname, err := os.Hostname()
	if err != nil {
		hostname = "inconnu"
		fmt.Printf("⚠️  Impossible de récupérer le hostname: %v\n", err)
	} else {
		fmt.Printf("💻 Hostname: %s\n", hostname)
	}

	// Vérification de la présence de Restic
	resticOK := verifierRestic()
	if resticOK {
		fmt.Println("✅ Restic détecté et fonctionnel")
	} else {
		fmt.Println("⚠️  Restic non trouvé - Mode simulation activé")
	}

	fmt.Printf("\n🔗 API Dashboard: %s\n", cfg.APIEndpoint)
	fmt.Println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
	fmt.Printf("🔄 Démarrage de la boucle heartbeat (intervalle: %v)\n\n", HeartbeatInterval)

	// Canal pour gérer l'arrêt propre
	stopChan := make(chan os.Signal, 1)
	signal.Notify(stopChan, syscall.SIGINT, syscall.SIGTERM)

	// Boucle de heartbeat
	go heartbeatLoop(cfg, hostname)

	// Attente du signal d'arrêt
	<-stopChan
	fmt.Println("\n\n🛑 Arrêt de l'agent demandé...")
	fmt.Println("👋 Agent Mon Rempart arrêté proprement.")
}

// heartbeatLoop envoie des signaux de vie au Dashboard à intervalles réguliers
func heartbeatLoop(cfg *config.Config, hostname string) {
	// Premier heartbeat immédiat
	sendHeartbeat(cfg, hostname)

	// Timer pour les heartbeats suivants
	ticker := time.NewTicker(HeartbeatInterval)
	defer ticker.Stop()

	for range ticker.C {
		sendHeartbeat(cfg, hostname)
	}
}

// sendHeartbeat envoie un signal de vie au Dashboard
func sendHeartbeat(cfg *config.Config, hostname string) {
	timestamp := time.Now().Format("15:04:05")

	// Préparation du payload
	payload := HeartbeatPayload{
		Hostname: hostname,
		Status:   "online",
	}

	// Sérialisation en JSON
	jsonData, err := json.Marshal(payload)
	if err != nil {
		fmt.Printf("[%s] ❌ Erreur de sérialisation: %v\n", timestamp, err)
		return
	}

	// Construction de l'URL
	url := cfg.APIEndpoint + "/api/agent/heartbeat"

	// Création de la requête
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Printf("[%s] ❌ Erreur de création requête: %v\n", timestamp, err)
		return
	}

	// Headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", fmt.Sprintf("%s/%s", AppName, Version))

	// Client HTTP avec timeout
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	// Envoi de la requête
	resp, err := client.Do(req)
	if err != nil {
		fmt.Printf("[%s] ⚠️  Dashboard injoignable: %v\n", timestamp, err)
		fmt.Printf("[%s] 🔄 Nouvelle tentative dans %v...\n", timestamp, HeartbeatInterval)
		return
	}
	defer resp.Body.Close()

	// Lecture de la réponse
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("[%s] ❌ Erreur lecture réponse: %v\n", timestamp, err)
		return
	}

	// Parsing de la réponse
	var response HeartbeatResponse
	if err := json.Unmarshal(body, &response); err != nil {
		fmt.Printf("[%s] ❌ Erreur parsing réponse: %v\n", timestamp, err)
		return
	}

	// Affichage du résultat
	if response.Success {
		fmt.Printf("[%s] ✅ Heartbeat envoyé - Commande reçue: %s\n", timestamp, response.Command)

		// Traitement des commandes
		switch response.Command {
		case "backup_now":
			fmt.Printf("[%s] 📦 Commande de sauvegarde reçue!\n", timestamp)
			// TODO: Lancer la sauvegarde
		case "update":
			fmt.Printf("[%s] 🔄 Mise à jour demandée\n", timestamp)
			// TODO: Mettre à jour l'agent
		case "shutdown":
			fmt.Printf("[%s] 🛑 Arrêt demandé par le serveur\n", timestamp)
			os.Exit(0)
		}
	} else {
		fmt.Printf("[%s] ❌ Erreur serveur: %s\n", timestamp, response.Message)
	}
}

// verifierRestic vérifie si Restic est installé et accessible
func verifierRestic() bool {
	path, err := exec.LookPath("restic")
	if err != nil {
		return false
	}

	cmd := exec.Command(path, "version")
	output, err := cmd.Output()
	if err != nil {
		return false
	}

	fmt.Printf("   Version: %s", string(output))
	return true
}
