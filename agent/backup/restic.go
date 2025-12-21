// Package backup - Wrapper Restic pour Mon Rempart
// Gère les opérations de sauvegarde via l'outil Restic
package backup

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"strings"
	"time"
)

// ResticConfig contient la configuration pour se connecter au dépôt Restic
type ResticConfig struct {
	// Endpoint S3 (ex: s3.fr-par.scw.cloud)
	S3Endpoint string
	// Nom du bucket
	S3Bucket string
	// Chemin dans le bucket (ex: client-1)
	S3Path string
	// Clé d'accès S3
	AccessKeyID string
	// Clé secrète S3
	SecretAccessKey string
	// Mot de passe de chiffrement du dépôt Restic
	ResticPassword string
}

// ResticWrapper encapsule les opérations Restic
type ResticWrapper struct {
	config     ResticConfig
	resticPath string
}

// BackupResult représente le résultat d'une sauvegarde
type BackupResult struct {
	Success        bool      `json:"success"`
	SnapshotID     string    `json:"snapshot_id,omitempty"`
	FilesNew       int       `json:"files_new"`
	FilesChanged   int       `json:"files_changed"`
	FilesUnmodified int      `json:"files_unmodified"`
	BytesAdded     int64     `json:"bytes_added"`
	BytesProcessed int64     `json:"bytes_processed"`
	Duration       float64   `json:"duration_seconds"`
	Error          string    `json:"error,omitempty"`
	Timestamp      time.Time `json:"timestamp"`
}

// Snapshot représente un snapshot Restic
type Snapshot struct {
	ID       string    `json:"id"`
	ShortID  string    `json:"short_id"`
	Time     time.Time `json:"time"`
	Hostname string    `json:"hostname"`
	Paths    []string  `json:"paths"`
	Tags     []string  `json:"tags,omitempty"`
}

// resticSummary représente la sortie JSON de restic backup
type resticSummary struct {
	MessageType         string  `json:"message_type"`
	FilesNew            int     `json:"files_new"`
	FilesChanged        int     `json:"files_changed"`
	FilesUnmodified     int     `json:"files_unmodified"`
	DirsNew             int     `json:"dirs_new"`
	DirsChanged         int     `json:"dirs_changed"`
	DirsUnmodified      int     `json:"dirs_unmodified"`
	DataBlobs           int     `json:"data_blobs"`
	TreeBlobs           int     `json:"tree_blobs"`
	DataAdded           int64   `json:"data_added"`
	TotalFilesProcessed int     `json:"total_files_processed"`
	TotalBytesProcessed int64   `json:"total_bytes_processed"`
	TotalDuration       float64 `json:"total_duration"`
	SnapshotID          string  `json:"snapshot_id"`
}

// NewResticWrapper crée une nouvelle instance du wrapper Restic
func NewResticWrapper(config ResticConfig) (*ResticWrapper, error) {
	// Recherche de l'exécutable restic
	resticPath, err := exec.LookPath("restic")
	if err != nil {
		return nil, fmt.Errorf("restic non trouvé dans le PATH: %w", err)
	}

	return &ResticWrapper{
		config:     config,
		resticPath: resticPath,
	}, nil
}

// getRepository retourne l'URL du dépôt S3
func (r *ResticWrapper) getRepository() string {
	return fmt.Sprintf("s3:%s/%s/%s", r.config.S3Endpoint, r.config.S3Bucket, r.config.S3Path)
}

// getEnv retourne les variables d'environnement nécessaires pour Restic
func (r *ResticWrapper) getEnv() []string {
	env := os.Environ()
	env = append(env,
		fmt.Sprintf("AWS_ACCESS_KEY_ID=%s", r.config.AccessKeyID),
		fmt.Sprintf("AWS_SECRET_ACCESS_KEY=%s", r.config.SecretAccessKey),
		fmt.Sprintf("RESTIC_REPOSITORY=%s", r.getRepository()),
		fmt.Sprintf("RESTIC_PASSWORD=%s", r.config.ResticPassword),
	)
	return env
}

// runCommand exécute une commande Restic avec l'environnement configuré
func (r *ResticWrapper) runCommand(args ...string) (string, string, error) {
	cmd := exec.Command(r.resticPath, args...)
	cmd.Env = r.getEnv()

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()
	return stdout.String(), stderr.String(), err
}

// InitRepo initialise le dépôt Restic s'il n'existe pas
func (r *ResticWrapper) InitRepo() error {
	fmt.Println("📦 Initialisation du dépôt Restic...")

	// Vérification si le dépôt existe déjà
	_, stderr, err := r.runCommand("snapshots", "--json")
	if err == nil {
		fmt.Println("   ✅ Dépôt déjà initialisé")
		return nil
	}

	// Si l'erreur n'est pas "repository not found", c'est une vraie erreur
	if !strings.Contains(stderr, "repository does not exist") &&
		!strings.Contains(stderr, "unable to open config file") &&
		!strings.Contains(stderr, "Is there a repository at") {
		return fmt.Errorf("erreur inattendue: %s", stderr)
	}

	// Initialisation du dépôt
	stdout, stderr, err := r.runCommand("init")
	if err != nil {
		return fmt.Errorf("échec init: %w - %s", err, stderr)
	}

	fmt.Printf("   ✅ Dépôt initialisé: %s\n", strings.TrimSpace(stdout))
	return nil
}

// RunBackup exécute une sauvegarde du chemin spécifié
func (r *ResticWrapper) RunBackup(targetPath string) (*BackupResult, error) {
	startTime := time.Now()
	result := &BackupResult{
		Timestamp: startTime,
	}

	fmt.Printf("📁 Sauvegarde de: %s\n", targetPath)

	// Vérification que le chemin existe
	if _, err := os.Stat(targetPath); os.IsNotExist(err) {
		result.Error = fmt.Sprintf("chemin inexistant: %s", targetPath)
		return result, fmt.Errorf(result.Error)
	}

	// Exécution de la sauvegarde avec sortie JSON
	stdout, stderr, err := r.runCommand("backup", targetPath, "--json")
	result.Duration = time.Since(startTime).Seconds()

	if err != nil {
		result.Error = fmt.Sprintf("échec sauvegarde: %s - %s", err.Error(), stderr)
		return result, fmt.Errorf(result.Error)
	}

	// Parsing de la sortie JSON (dernière ligne = summary)
	lines := strings.Split(strings.TrimSpace(stdout), "\n")
	if len(lines) == 0 {
		result.Error = "sortie vide de restic"
		return result, fmt.Errorf(result.Error)
	}

	// Recherche de la ligne summary
	for _, line := range lines {
		var summary resticSummary
		if err := json.Unmarshal([]byte(line), &summary); err != nil {
			continue
		}

		if summary.MessageType == "summary" {
			result.Success = true
			result.SnapshotID = summary.SnapshotID
			result.FilesNew = summary.FilesNew
			result.FilesChanged = summary.FilesChanged
			result.FilesUnmodified = summary.FilesUnmodified
			result.BytesAdded = summary.DataAdded
			result.BytesProcessed = summary.TotalBytesProcessed
			result.Duration = summary.TotalDuration

			fmt.Printf("   ✅ Snapshot créé: %s\n", summary.SnapshotID)
			fmt.Printf("   📊 %d nouveaux, %d modifiés, %d inchangés\n",
				summary.FilesNew, summary.FilesChanged, summary.FilesUnmodified)
			fmt.Printf("   💾 %s ajoutés\n", formatBytes(summary.DataAdded))

			return result, nil
		}
	}

	// Si on n'a pas trouvé de summary mais pas d'erreur non plus
	result.Success = true
	return result, nil
}

// GetSnapshots retourne la liste des snapshots du dépôt
func (r *ResticWrapper) GetSnapshots() ([]Snapshot, error) {
	stdout, stderr, err := r.runCommand("snapshots", "--json")
	if err != nil {
		return nil, fmt.Errorf("échec récupération snapshots: %w - %s", err, stderr)
	}

	var snapshots []Snapshot
	if err := json.Unmarshal([]byte(stdout), &snapshots); err != nil {
		return nil, fmt.Errorf("échec parsing snapshots: %w", err)
	}

	return snapshots, nil
}

// formatBytes formate une taille en octets de manière lisible
func formatBytes(bytes int64) string {
	const (
		KB = 1024
		MB = KB * 1024
		GB = MB * 1024
	)

	switch {
	case bytes >= GB:
		return fmt.Sprintf("%.2f Go", float64(bytes)/float64(GB))
	case bytes >= MB:
		return fmt.Sprintf("%.2f Mo", float64(bytes)/float64(MB))
	case bytes >= KB:
		return fmt.Sprintf("%.2f Ko", float64(bytes)/float64(KB))
	default:
		return fmt.Sprintf("%d octets", bytes)
	}
}
