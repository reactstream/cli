
Przykład użycia:

```bash
# Analiza pojedynczego komponentu
./reactstream-analyze MyComponent.js --debug

# Analiza z automatyczną naprawą problemów
./reactstream-analyze MyComponent.js --fix

# Porównanie dwóch komponentów
./reactstream-analyze MyComponent1.js MyComponent2.js --compare

# Pełna analiza z debugowaniem i sugestiami optymalizacji
./reactstream-analyze MyComponent.js --debug --verbose
```


Główne funkcje narzędzia:

1. Analiza składni i struktury:
- Sprawdzanie poprawności składni JSX
- Analiza importów i eksportów
- Wykrywanie nieużywanych importów

2. Analiza hooków:
- Sprawdzanie zasad hooków
- Wykrywanie potencjalnych problemów z zależnościami
- Sugestie optymalizacji

3. Analiza wydajności:
- Wykrywanie niepotrzebnych rerenderów
- Sprawdzanie optymalizacji memoizacji
- Analiza użycia useCallback i useMemo

4. Debugowanie:
- Automatyczne dodawanie punktów debugowania
- Śledzenie aktualizacji stanu
- Monitorowanie efektów ubocznych

5. Dostępność:
- Sprawdzanie atrybutów ARIA
- Weryfikacja alt dla obrazów
- Kontrola kontrastów i semantyki

6. Optymalizacje:
- Sugestie użycia React.memo
- Optymalizacja hooków
- Refaktoryzacja stanu

7. Porównywanie komponentów:
- Analiza podobieństw
- Wykrywanie duplikacji
- Sugestie współdzielenia kodu

Aby połączyć oba narzędzia, możesz użyć:
```bash
# Najpierw analiza
./reactstream-analyze MyComponent.js --debug

# Następnie uruchomienie z debuggerem
./reactstream MyComponent.js --port=3000 --debug
```