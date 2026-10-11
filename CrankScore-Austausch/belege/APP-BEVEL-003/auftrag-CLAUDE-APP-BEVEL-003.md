# APP-BEVEL-003 — Nachbesserungsauftrag nach Live-Prüfung

Prüfdatum: 11.10.2026. In der App angezeigter Versionsstand: 11.10.2026, 11:56 Uhr.
App: https://trostliam-hub.github.io/dreambuild/index.html
Referenz: https://www.bevel.health/de
Vorheriger Auftrag: CLAUDE-APP-BEVEL-002.md

## Befund: Was vorhanden ist und was noch fehlt

Dieser Bericht beschreibt die öffentlich sichtbare App. Er ist kein vollständiger Code-Audit. Fehlende Nachweise sind nicht automatisch der Beweis, dass intern nichts implementiert wurde.

| Anforderung | Im Browser beobachtet | Bewertung |
| --- | --- | --- |
| Prüfungstab entfernen | Entfernt; aufklappbare Prüfung zwischen Radbild und Rahmen vorhanden | Umgesetzt; beibehalten |
| Teilefinder | Kachel vorhanden; Kategorie, Ziele, Marke und Budget verfügbar | Teilweise umgesetzt; großer überladener Dialog statt kurzer Führung |
| Budgetfilter | Bei „Leichter“, Bremsen und 250 € ändern sich Ergebnisse; 8 über Budget ausgeblendet | Funktioniert im getesteten Fall; Preise sind Richtpreise |
| Wunschliste | Formula Cura 2 aus Vergleich gemerkt; Ziel und Budget übernommen; Aufbau blieb gleich | Merken funktioniert; Testeintrag anschließend entfernt |
| Vergleich | Tabelle mit Gewicht, Scheiben, Kolben, Kosten und Eignung vorhanden | Teilweise umgesetzt; Bewertung und Kompatibilitätsaussage problematisch |
| Produktlinks/Preisvergleich | Bremsvorschläge ohne geprüftes Angebot; XT-Einkaufsdialog mit bike-components- und Bike24-Suchlinks; „Noch keine Live-Preise“ | Kernanforderung im geprüften Ablauf nicht erfüllt |
| Adapter | Vorschlag 220/203 mm nennt generische Adapter +23 und +40 mm | Exakte Artikel, Freigaben und vollständige Kosten im Vorschlag fehlen |
| Bevel-orientiertes Redesign | Ähnliche Kopfzeilen, mehrere Navigationsebenen, alte Anleitungskarte, rechte Score-Säule und lange Teilegruppen | Grundlegender visueller Umbau bleibt aus |
| Produktbilder | Geprüfte Bremsvorschläge bestehen aus Text; keine Produktbilder sichtbar | Offen |
| Hochwertiges Rad/Blender | Vereinfachte Seitenansicht mit allgemein gezeichneten Anbauteilen | Gewünschte visuelle Qualität nicht erreicht; Blender-Dateien nicht geprüft |
| Onboarding | Neue Drei-Szenen-Einführung; Überspringen führt zur weiteren Einrichtung mit erneutem Überspringen | Struktur ergänzt; Einstieg noch verschachtelt, Inszenierung überwiegend Textchips |
| Animationen, Mobilansicht, EN, Speicherung nach Neustart | In diesem Audit nicht vollständig geprüft | Nicht als fehlend behaupten; gezielt nachweisen |

Weitere konkrete Funde:
- Bremsspezifikation im Aufbau: „180/180 mm · 180/180 mm“ doppelt.
- Gabel: „140 mm … Federweg 140 mm“ doppelt.
- Stütze: „34,9 mm · Durchmesser 34,9 mm“ doppelt.
- Bei „Mehr Bremskraft“ verschwindet die Markenauswahl im getesteten Zustand ohne Ergebnisse.
- Bei „Leichter“ zeigt die Formula-Cura-2-Kachel „Passt“, obwohl Scheibendicke und Belagtyp als unbekannt genannt werden; im Vergleich sinkt Kompatibilität von 100 auf 98.
- Der Vergleich bezeichnet „2 statt 4 Kolben“ unmittelbar als „schlechter“. Das ersetzt keine modellbezogene Leistungsbewertung.
- Im Vergleich ist keine erkennbare Aktion „Zurück zu Ergebnissen“ vorhanden; es bleibt Schließen.
- Die eingeklappte Prüfung meldet keine Konflikte; fehlende Körper-/Gewichtsdaten werden erst in anderen Bereichen beziehungsweise nach Aufklappen erläutert.
- Die vollständige ehemalige Sparliste ist nicht mehr der normale sichtbare Upgrade-Tab. Diesen alten Befund nicht erneut als aktuellen Fehler ausgeben.

---

## Auftrag an Claude Code

Claude, der bisherige Stand erfüllt den vollständigen Redesign-Auftrag noch nicht. Einige Funktionen wurden ergänzt, aber ich möchte eine sichtbar neue, hochwertig gestaltete App und einen durchgängig funktionierenden Auswahlprozess. Überarbeite die App tatsächlich und nutze den obigen Befund als konkrete Nachbesserungsliste.

### 1. So meine ich die Orientierung an Bevel

Analysiere die tatsächliche Bevel-App anhand offizieller Screenshots, einschließlich heller und dunkler Darstellung. Schreibe zuerst kurz auf, welche Gestaltungsprinzipien du konkret auf CrankScore überträgst: Blickführung, Typografie, Kennzahlen, Oberflächen, Abstände, Informationsdichte und Interaktion.

Ich möchte den sorgfältigen Charakter einer hochwertigen mobilen App: übersichtliche Zusammenfassungen, klare Prioritäten, gezielte Farben und Details, die sich leicht öffnen lassen. CrankScore soll interessant wirken, ohne durch Leuchteffekte oder viele Badges Aufmerksamkeit zu erzwingen.

Entwickle dafür eine eigenständige MTB-Gestaltung. Verändere den Seitenaufbau, Größenverhältnisse und die Bedienung sichtbar. Ein Austausch von Farben, Rundungen und Tabs genügt nicht.

Konkreter Zielaufbau:
- Oben eine ruhige Kopfzeile mit aktivem Rad und leicht erreichbarem Profil.
- Ein großzügiger, hochwertiger Bereich für das Rad. Die alte Anleitungskarte darf ihn nicht an den Rand drängen.
- Kompakte Score-Zusammenfassung: großer Gesamtring mit Logo über der Zahl, zwei dezente kleinere Ringe, klare Kurzinterpretation. Keine raumfüllende Score-Säule in jeder Ansicht.
- Direkt unter dem Rad und vor dem Rahmen die bereits vorhandene einklappbare Prüfung.
- Sichtbarer Einstieg „Was möchtest du an deinem Rad verbessern?“.
- Danach geordnete Teilegruppen mit kurzen Zeilen und Details auf Nachfrage.
- Wunschliste, Fahrwerk und Einkauf direkt erreichbar; sekundäre Kategorien erst dort zeigen, wo sie gebraucht werden.

Mobile zuerst gestalten, danach Desktop anpassen. Nutze eine klar definierte Schrift- und Abstandsskala. Als Ausgangspunkt: 16 px gut lesbarer Fließtext, 20–28 px Abschnittstitel, ungefähr 44 px Touch-Ziele und großzügige Abstände. Überschriften, Zahlen und Hauptaktionen müssen sich eindeutig von Hilfstext unterscheiden.

Behalte Stahlblau als Hauptakzent. Helle warme Neutralflächen und abgestufte dunkle Anthrazitflächen sollen jeweils bewusst gestaltet sein. Alle Produkttexte natürlich in Deutsch und Englisch. Entferne doppelte Spezifikationen und unnötige Fachwörter aus dem ersten Blick.

### 2. Teilewechsel genau so umsetzen

Beispiel: Ich habe bereits XT-M8120-Bremsen und suche etwas anderes.

Ein Klick auf „Passende Bremse finden“ öffnet eine kurze Auswahl, in der mein Rad und die aktuelle Bremse schon bekannt sind. Frage verständlich:
1. Was soll sich verbessern? Zum Beispiel Kontrolle, Belastbarkeit bei langen Abfahrten, Gewicht, Wartung oder defektes Teil ersetzen.
2. Welche Marke? Eine oder mehrere Marken beziehungsweise „Marke egal“.
3. Ist der Preis offen oder welches Gesamtbudget habe ich?

Zeige diese Angaben übersichtlich; gib mir zunächst keine lange Fläche mit Entfernen, Preisen, Glossar, Katalogtabs und vielen technischen Feldern. Weitere Funktionen können nachgelagert erreichbar bleiben.

Marke und Budget bleiben auch bei null Ergebnissen verfügbar. Jede Auswahl soll korrigierbar sein. Keine ungefragt vorbelegte Empfehlung, die mich sofort auf „größere Scheiben“ lenkt.

Danach erscheinen ungefähr drei übersichtliche Produktkacheln mit echtem Produktbild, exaktem Modell und Variante, tatsächlichem Angebot, kurzer Begründung und erkennbarem Kompatibilitätsstatus. Hauptaktionen: Vergleichen, Merken und Zum Produkt. Im Vergleich muss „Zurück zu Ergebnissen“ Filter, Budget und Scrollposition erhalten.

### 3. Keine vereinfachten oder widersprüchlichen Bewertungen

„Leichter“ darf nicht automatisch alle Nachteile rechtfertigen. Ich möchte auf Wunsch Gewicht reduzieren und trotzdem für meinen Einsatz ausreichend leistungsfähige Bremsen behalten.

Nutze Ziele zusammen mit Mindestanforderungen des aktiven Rads. Stelle sinnvolle Upgrades zuerst dar. Teile mit deutlichen Einschränkungen nur nach aktiver Auswahl „Kompromisse anzeigen“. Erkläre dann die konkrete Abwägung. Günstigere Ersatzteile bleiben ein ausdrücklich gewählter Modus.

Bewerte Bremsleistung nicht allein anhand der Kolbenzahl. Die Vergleichstabelle darf die Bauart nennen; ein pauschales „schlechter“ benötigt darüber hinaus belastbare modellbezogene Gründe. Auch „Trail 4/5“ braucht eine dokumentierte nachvollziehbare Grundlage.

Prüfe die Gewichtsgrundlage: Einzelbremse, vollständiges Paar, Scheiben und Zubehör müssen auf beiden Seiten gleich abgegrenzt sein. Keine präzisen Gewichtsvorteile aus ungleichen Lieferumfängen.

Behebe „Passt“ bei gleichzeitig unbekannten relevanten Daten und gesunkenem Kompatibilitätswert. Verwende klare Zustände wie „Geprüft passend“, „Passend mit Zubehör“ oder „Noch zu prüfen“. Fehlende Daten müssen im kompakten Prüfungsbereich bereits erkennbar sein. Gute Teile dürfen als „Behalten sinnvoll“ enden.

### 4. Produktseiten und echte Gesamtkosten fertigstellen

Der getestete Ablauf endet noch bei „kein geprüftes Angebot“ oder einer Shopsuche. Das ist ein ehrlicher Zwischenstand, erfüllt aber den Produktfinder nicht.

Setze eine belastbare Angebotsversorgung um. Vergleiche verfügbare identische Varianten und liefere einen geprüften Link direkt zur Produktdetailseite. Berücksichtige Bremsenpaar versus Einzelbremse, Scheibengrößen, Lieferumfang, Versand und notwendiges Zubehör.

Zeige „Günstigstes geprüftes Angebot“, Händler, Preisstand und Vergleichsumfang. Keine erfundenen Preise oder Links. Verifizierte Produktdetailseiten können bereits ohne automatischen Livepreis sinnvoll hinterlegt werden; deren Preis darf dann nicht als aktuell behauptet werden.

Fehlt für automatische Angebote tatsächlich ein Zugang, implementiere den funktionierenden erreichbaren Teil und benenne den erforderlichen Zugang konkret. Ersetze die Kernanforderung nicht dauerhaft durch einen Hinweis auf später. Vergleiche das Marktangebot soweit Daten verfügbar sind; behaupte keine umfassende Marktprüfung auf Basis des lokalen Katalogs allein.

### 5. Adapter wirklich automatisch und konkret

„Post-Mount-Adapter +23 mm“ ist keine vollständige Kaufentscheidung. Ich möchte erfahren: welcher genaue Artikel, für vorne oder hinten, warum nötig, ob der vorhandene weiterverwendet werden kann und was alles zusammen kostet.

Prüfe native Aufnahme, Zielscheibe, Modelljahr, Herstellerfreigaben, maximale Scheibengrößen und weitere relevante Bremsstandards. Die im Audit angebotenen 220/203 mm sind kein Nachweis korrekter Freigabe; prüfe diese Kombination ausdrücklich.

Zeige vor Übernahme ein vollständiges Änderungspaket: Bremse, Scheiben, Adapter, gegebenenfalls Befestigungen und weitere notwendige Teile. Übernimm es gemeinsam mit Rückgängig. Keine Duplikate und keine unverifiziert bestätigte Passform. Fehlende entscheidende Daten gezielt abfragen.

### 6. Wunschliste einfach weiterentwickeln

Das getestete Merken funktioniert; bewahre es. Verdeutliche aber „nur ansehen“, „im Aufbau testen“, „kaufen“ und „als tatsächlich montiert übernehmen“.

Eigener Bestand bleibt die Grundlage aller Empfehlungen. Wunschprodukte ersetzen ihn nicht. Verhindere, dass ein Testwechsel dauerhaft als real verbaut gilt. Eine Vorschau braucht sichtbaren Teststatus, Abbrechen und Übernehmen. Teste Speicherung und Trennung mehrerer Räder.

Im Modus „Mein Rad“ enthält die Einkaufsliste gewünschte neue Teile und erforderliches Zubehör. Bereits vorhandene Teile erscheinen nicht ungefragt als erneuter Kauf. Im Traumrad-Modus ist eine vollständige Aufbau-Einkaufsliste sinnvoll.

### 7. Rad und Onboarding hochwertiger gestalten

Die vereinfachte Radzeichnung erreicht die gewünschte Produktqualität noch nicht. Nutze Blender für das Propain-Spindrift-5-AL-Beispielmodell: realistische Form, modularer Aufbau, überzeugende Materialien und professionelle Beleuchtung. Liefere .blend, optimiertes GLB und Render-Fallback. Behaupte für andere Modelle keine maßgetreue Geometrie ohne passende Referenzen.

Die Einführung soll den Nutzen visuell zeigen. Stelle etwa eine Bremse samt fehlendem Adapter dar und animiere die passende Lösung. Eine Wolke aus technischen Textchips reicht als Inszenierung nicht aus.

Ein einziger klarer Einstieg: kurze überspringbare Einführung, anschließend direkt Rad übernehmen oder einrichten. Kein wiederholtes Willkommen und kein zweites notwendiges Überspringen. Zeige den Nutzen ohne Druck oder Übertreibung.

### 8. Abschluss mit Nachweisen

Nutze passende verfügbare Design-, Recherche-, Browser- und Entwicklungsskills. Prüfe zuerst vorhandene Werkzeuge; installiere notwendige vertrauenswürdige Ergänzungen soweit möglich. Blender für 3D. Bewahre Nutzerdaten.

Arbeite die Fehler ab, prüfe erneut und verbessere den Entwurf. Beurteile das neue Design anhand echter Vorher-Nachher-Ansichten bei 390 px Mobilbreite und auf Desktop, in Hell und Dunkel. Prüfe zusätzlich Deutsch/Englisch, reduzierte Bewegung und die Kernwege:
- bestehende gute Bremse und kein sinnvoller Wechsel;
- neues Ziel mit Budget und Markenfilter;
- konkrete Produktseite und vollständige Kosten;
- notwendiger, unnötiger und nicht bestimmbarer Adapter;
- Vergleich und Rückkehr;
- Merken, Vorschau, Rückgängig, Neuladen und Radwechsel.

Die Animationen sollen flüssig und kurz sein: Themewechsel, Dialoge, Prüfung, Teilewechsel und Merken. Weise ihre Funktion tatsächlich nach; ein statischer Screenshot belegt keine Animation.

Schreibe automatisch den Abschluss in unseren Austauschordner: Anforderung, Umsetzung, konkrete Prüfung und Ergebnis. Trenne vollständig erledigt, teilweise erledigt und blockiert. „Perfekt“ oder „fertig“ ohne erfüllte Kriterien genügt nicht. Wenn ein gemeinsamer Ordner nicht zugänglich ist, liefere die Austauschdatei und sage es offen.

Prüfe außerdem, dass der geprüfte Build und der für mich sichtbare Stand zusammenpassen. Bei unterschiedlichen Versionen nenne Branch, Commit, Versionsstempel und die tatsächlich erreichbare Vorschau. Eine weiterhin alte öffentliche Ansicht ist kein Nachweis des neuen Designs.
