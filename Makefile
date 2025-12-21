# =============================================================================
# Mon Rempart - Makefile
# =============================================================================
# Commandes pour compiler et packager l'agent pour différentes plateformes
# Usage: make [commande]
# =============================================================================

# Variables
APP_NAME := mon-rempart-agent
VERSION := 0.4
AGENT_DIR := agent
DIST_DIR := web/public/downloads
LDFLAGS := -ldflags="-s -w -X main.Version=$(VERSION)"

# Couleurs pour les messages
GREEN := \033[0;32m
YELLOW := \033[0;33m
NC := \033[0m # No Color

# =============================================================================
# Commandes principales
# =============================================================================

.PHONY: all clean build-all build-windows build-mac build-mac-intel build-linux help

## Compile pour toutes les plateformes
all: build-all

## Affiche l'aide
help:
	@echo "$(GREEN)Mon Rempart - Commandes de build$(NC)"
	@echo ""
	@echo "Usage: make [commande]"
	@echo ""
	@echo "Commandes disponibles:"
	@echo "  $(YELLOW)build-all$(NC)       - Compile pour Windows, Mac et Linux"
	@echo "  $(YELLOW)build-windows$(NC)   - Compile pour Windows (amd64)"
	@echo "  $(YELLOW)build-mac$(NC)       - Compile pour Mac (Apple Silicon)"
	@echo "  $(YELLOW)build-mac-intel$(NC) - Compile pour Mac (Intel)"
	@echo "  $(YELLOW)build-linux$(NC)     - Compile pour Linux (amd64)"
	@echo "  $(YELLOW)clean$(NC)           - Supprime les fichiers compilés"
	@echo ""
	@echo "Les binaires sont créés dans: $(DIST_DIR)/"
	@echo ""

## Crée le dossier de distribution
$(DIST_DIR):
	@mkdir -p $(DIST_DIR)

## Nettoie les fichiers compilés
clean:
	@echo "$(YELLOW)🧹 Nettoyage...$(NC)"
	@rm -rf $(DIST_DIR)/*.exe $(DIST_DIR)/*-mac* $(DIST_DIR)/*-linux
	@echo "$(GREEN)✅ Nettoyage terminé$(NC)"

# =============================================================================
# Build par plateforme
# =============================================================================

## Compile pour toutes les plateformes
build-all: build-windows build-mac build-mac-intel build-linux
	@echo ""
	@echo "$(GREEN)✅ Compilation terminée pour toutes les plateformes !$(NC)"
	@echo ""
	@ls -lh $(DIST_DIR)/

## Compile pour Windows (amd64)
build-windows: $(DIST_DIR)
	@echo "$(YELLOW)🪟 Compilation Windows (amd64)...$(NC)"
	@cd $(AGENT_DIR) && GOOS=windows GOARCH=amd64 go build $(LDFLAGS) -o ../$(DIST_DIR)/$(APP_NAME).exe .
	@echo "$(GREEN)✅ $(DIST_DIR)/$(APP_NAME).exe$(NC)"

## Compile pour Mac Apple Silicon (arm64)
build-mac: $(DIST_DIR)
	@echo "$(YELLOW)🍎 Compilation Mac (Apple Silicon)...$(NC)"
	@cd $(AGENT_DIR) && GOOS=darwin GOARCH=arm64 go build $(LDFLAGS) -o ../$(DIST_DIR)/$(APP_NAME)-mac-arm64 .
	@echo "$(GREEN)✅ $(DIST_DIR)/$(APP_NAME)-mac-arm64$(NC)"

## Compile pour Mac Intel (amd64)
build-mac-intel: $(DIST_DIR)
	@echo "$(YELLOW)🍎 Compilation Mac (Intel)...$(NC)"
	@cd $(AGENT_DIR) && GOOS=darwin GOARCH=amd64 go build $(LDFLAGS) -o ../$(DIST_DIR)/$(APP_NAME)-mac-intel .
	@echo "$(GREEN)✅ $(DIST_DIR)/$(APP_NAME)-mac-intel$(NC)"

## Compile pour Linux (amd64)
build-linux: $(DIST_DIR)
	@echo "$(YELLOW)🐧 Compilation Linux (amd64)...$(NC)"
	@cd $(AGENT_DIR) && GOOS=linux GOARCH=amd64 go build $(LDFLAGS) -o ../$(DIST_DIR)/$(APP_NAME)-linux .
	@echo "$(GREEN)✅ $(DIST_DIR)/$(APP_NAME)-linux$(NC)"

# =============================================================================
# Dashboard
# =============================================================================

## Lance le serveur de développement
dev:
	@cd web && npm run dev

## Build le dashboard pour production
build-web:
	@cd web && npm run build

## Installe les dépendances du dashboard
install:
	@cd web && npm install
