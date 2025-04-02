#!/bin/bash
# start.sh

source .env

# Funkcja do logowania
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Sprawdzenie wymaganych narzędzi
check_requirements() {
    log "Sprawdzanie wymagań..."

    # Lista wymaganych narzędzi
    REQUIRED_TOOLS=("php" "composer" "npm" "git")

    for tool in "${REQUIRED_TOOLS[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            error "Brak wymaganego narzędzia: $tool"
            exit 1
        fi
    done

    # Sprawdzenie wersji PHP
    PHP_VERSION=$(php -v | head -n 1 | cut -d " " -f 2 | cut -d "." -f 1,2)
    if (( $(echo "$PHP_VERSION < 8.0" | bc -l) )); then
        error "Wymagana wersja PHP >= 8.0 (obecnie: $PHP_VERSION)"
        exit 1
    fi

    success "Wszystkie wymagania spełnione"
}

# Inicjalizacja projektu
init_project() {
    log "Inicjalizacja projektu $PROJECT_NAME..."

    # Sprawdzenie czy istnieje .env
    if [ ! -f .env ]; then
        warning "Brak pliku .env"
        if [ -f .env.example ]; then
            log "Kopiowanie .env.example do .env"
            cp .env.example .env
        else
            error "Brak pliku .env.example"
            exit 1
        fi
    fi

    # Instalacja zależności PHP
    if [ -f "composer.json" ]; then
        log "Instalacja zależności PHP..."
        composer install
    fi

    # Instalacja zależności Node.js
    if [ -f "package.json" ]; then
        log "Instalacja zależności Node.js..."
        npm install
    fi

    success "Inicjalizacja zakończona"
}

# Konfiguracja środowiska deweloperskiego
setup_dev_env() {
    log "Konfiguracja środowiska deweloperskiego..."

    # Tworzenie struktury katalogów
    mkdir -p {logs,temp,cache,uploads}
    chmod 777 {logs,temp,cache,uploads}

    # Konfiguracja PHP
    PHP_INI="php.ini"
    if [ ! -f "$PHP_INI" ]; then
        log "Tworzenie $PHP_INI..."
        cat << EOF > "$PHP_INI"
display_errors = On
error_reporting = E_ALL
memory_limit = 256M
upload_max_filesize = 64M
post_max_size = 64M
max_execution_time = 300
date.timezone = Europe/Warsaw
EOF
    fi

    success "Środowisko deweloperskie skonfigurowane"
}

# Uruchomienie serwera deweloperskiego
run_dev_server() {
    log "Uruchamianie serwera deweloperskiego..."

    # Sprawdzenie dostępności portu
    PORT=$DEV_SERVER_PORT
    while lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; do
        warning "Port $PORT zajęty, próba portu $((PORT+1))..."
        PORT=$((PORT+1))
    done

    # Uruchomienie serwera PHP
    php -S localhost:$PORT -t $LOCAL_PATH/ &
    SERVER_PID=$!

    success "Serwer uruchomiony na http://localhost:$PORT"
    log "PID serwera: $SERVER_PID"

    # Zapisanie PID do pliku
    echo $SERVER_PID > .server.pid

    # Przechwytywanie CTRL+C
    trap cleanup SIGINT SIGTERM

    # Oczekiwanie na zakończenie
    wait $SERVER_PID
}

# Sprzątanie przy zamknięciu
cleanup() {
    log "Zatrzymywanie serwera..."
    if [ -f .server.pid ]; then
        kill $(cat .server.pid)
        rm .server.pid
    fi
    success "Serwer zatrzymany"
    exit 0
}

# Wyświetlanie pomocy
show_help() {
    echo "Użycie: $0 [opcja]"
    echo ""
    echo "Opcje:"
    echo "  init    - Inicjalizacja projektu"
    echo "  dev     - Uruchomienie serwera deweloperskiego"
    echo "  clean   - Wyczyszczenie cache i plików tymczasowych"
    echo "  help    - Wyświetlenie tej pomocy"
    echo ""
}

# Czyszczenie projektu
clean_project() {
    log "Czyszczenie projektu..."

    # Lista katalogów do wyczyszczenia
    DIRS_TO_CLEAN=("logs" "temp" "cache" "uploads")

    for dir in "${DIRS_TO_CLEAN[@]}"; do
        if [ -d "$dir" ]; then
            log "Czyszczenie katalogu $dir..."
            rm -rf "$dir"/*
        fi
    done

    # Usunięcie plików tymczasowych
    find . -name "*.log" -type f -delete
    find . -name "*.cache" -type f -delete
    find . -name ".DS_Store" -type f -delete

    success "Projekt wyczyszczony"
}

# Główna logika skryptu
main() {
    case "$1" in
        "init")
            check_requirements
            init_project
            setup_dev_env
            ;;
        "dev")
            check_requirements
            run_dev_server
            ;;
        "clean")
            clean_project
            ;;
        "help"|"")
            show_help
            ;;
        *)
            error "Nieznana opcja: $1"
            show_help
            exit 1
            ;;
    esac
}

# Uruchomienie skryptu
main "$@"
