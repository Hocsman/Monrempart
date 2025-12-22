// Package config - Configuration de l'agent Mon Rempart
package config

import (
	"os"
	"path/filepath"
)

// Config contient toutes les configurations de l'agent
type Config struct {
	// Chemins
	ConfigPath   string   // Chemin du fichier de configuration
	BackupPaths  []string // Répertoires à sauvegarder
	ExcludePaths []string // Répertoires à exclure

	// API Dashboard
	APIEndpoint string // URL de l'API du Dashboard
	APIKey      string // Clé d'authentification

	// Stockage S3 (Scaleway)
	S3Endpoint  string // Endpoint S3 Scaleway
	S3Bucket    string // Nom du bucket
	S3AccessKey string // Clé d'accès S3
	S3SecretKey string // Clé secrète S3

	// Restic
	ResticPath     string // Chemin vers l'exécutable Restic
	ResticPassword string // Mot de passe du dépôt Restic

	// Planification
	BackupSchedule string // Expression cron pour les sauvegardes
}

// LoadConfig charge la configuration depuis les variables d'environnement
// ou utilise des valeurs par défaut
func LoadConfig() *Config {
	homeDir, _ := os.UserHomeDir()
	configPath := filepath.Join(homeDir, ".monrempart", "config.json")

	return &Config{
		ConfigPath:   configPath,
		BackupPaths:  []string{},
		ExcludePaths: []string{},

		// URL de production par défaut
		APIEndpoint: getEnvOrDefault("MONREMPART_API_URL", "https://mon-rempart.fr"),
		APIKey:      getEnvOrDefault("MONREMPART_API_KEY", ""),

		// Configuration S3 (à remplir en production)
		S3Endpoint:  getEnvOrDefault("MONREMPART_S3_ENDPOINT", "s3.fr-par.scw.cloud"),
		S3Bucket:    getEnvOrDefault("MONREMPART_S3_BUCKET", ""),
		S3AccessKey: getEnvOrDefault("MONREMPART_S3_ACCESS_KEY", ""),
		S3SecretKey: getEnvOrDefault("MONREMPART_S3_SECRET_KEY", ""),

		// Restic
		ResticPath:     getEnvOrDefault("MONREMPART_RESTIC_PATH", "restic"),
		ResticPassword: getEnvOrDefault("MONREMPART_RESTIC_PASSWORD", ""),

		// Sauvegarde quotidienne à 2h du matin par défaut
		BackupSchedule: getEnvOrDefault("MONREMPART_BACKUP_SCHEDULE", "0 2 * * *"),
	}
}

// getEnvOrDefault retourne la valeur d'une variable d'environnement
// ou une valeur par défaut si elle n'est pas définie
func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
