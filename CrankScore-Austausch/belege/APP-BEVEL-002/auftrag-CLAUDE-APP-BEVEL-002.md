# Claude-Code-Auftrag: CrankScore vollständig überarbeiten

Überarbeite die bestehende CrankScore-App im Repository und setze die Änderungen tatsächlich um. Liefere eine funktionierende App, nicht nur Vorschläge oder ein Mockup.

App: https://trostliam-hub.github.io/dreambuild/index.html
Designreferenz: https://www.bevel.health/de

## 1. Bestand prüfen und Werkzeuge nutzen

Lies zuerst die Projektanweisungen und unseren Austauschordner. Prüfe die aktuelle App im Browser, den Code, die Datenmodelle und alle wichtigen Nutzerwege. Bewahre vorhandene Nutzerdaten und sinnvolle Funktionen.

Nutze eigenständig die für diese Aufgabe passenden verfügbaren Skills, Plugins und Werkzeuge für Design, Browserprüfung, Entwicklung und Recherche. Installiere erforderliche, vertrauenswürdige Werkzeuge aus offiziellen Quellen, soweit deine Umgebung das erlaubt. Prüfe zuerst vorhandene Möglichkeiten. Installiere nichts nur um mehr Plugins zu haben. Dokumentiere verwendete Werkzeuge und echte Einschränkungen; behaupte keine Installation oder Prüfung, die nicht stattgefunden hat.

## 2. Designrichtung: Bevel-Qualität mit eigener MTB-Identität

Analysiere echte Bevel-App-Screenshots. Übertrage deren klare Hierarchie, gut lesbare Kennzahlen, angenehme Abstände und sorgfältige Detailgestaltung auf CrankScore. Entwickle eine eigene Gestaltung mit Charakter.

Das Ergebnis soll professionell, modern und hochwertig wirken, aber einfach verständlich bleiben. Vermeide eintönige Kartenwände, übermäßige Pillen, Neon-Glows, dekorative Verläufe und unnötige Fachtexte. Nutze Typografie, ein hochwertiges Radbild und gezielte Kontraste, damit die App interessant wirkt.

Behalte eine zurückhaltende stahlblaue Akzentfarbe. Keine orange Hauptfarbe. Entwickle gleichwertige helle und dunkle Oberflächen: helle warme Neutralflächen beziehungsweise weiche Anthrazittöne, klare Abstufungen und ausreichenden Kontrast.

Der Gesamtscore bleibt prominent: CrankScore-Logo im Ring, darunter die Zahl. Die beiden kleineren Ringe für Kompatibilität und Einsatz sind dezent und gut lesbar. Reduziere das vorhandene Leuchten. Erkläre kurz, woraus die Werte entstehen. Zeige fehlende Daten sichtbar; eine hohe Zahl darf keine vollständige technische Verifikation suggerieren.

Alle Texte in natürlichem Deutsch und Englisch. Keine wörtlichen Übersetzungen oder Werbefloskeln. Einheitliche Begriffe, verständliche Buttons und kurze hilfreiche Erklärungen.

## 3. Aufbau und Navigation vereinfachen

Die aktuelle App besitzt viele Navigationsebenen, technische Badges und dauerhaft sichtbare Details. Vereinfache das konsequent.

- „Aufbau“ wird die zentrale Arbeitsfläche mit gut sichtbarem Radfoto beziehungsweise 3D-Rad.
- Entferne den eigenständigen Tab „Prüfung“.
- Platziere die Kompatibilitätsprüfung im Aufbau direkt unter dem Radbild und über der Rahmengruppe.
- Standardmäßig zeigt sie nur eine kompakte Zusammenfassung wie „2 Punkte prüfen“ oder „Keine Konflikte in den geprüften Angaben“. Per Klick lässt sie sich öffnen und schließen.
- Probleme führen direkt zum betroffenen Teil und zu einer konkreten Lösung.
- Wichtige Konflikte bleiben auch bei geschlossenem Bereich erkennbar.
- Jede Teilezeile zeigt zunächst Kategorie, Modell, wichtigste Angabe und eine klare Aktion. Weitere Standards, Modelljahre und Erklärungen erscheinen bei Bedarf.
- Reduziere doppelte Aktionen und Editoren. Nutzer sollen ohne Umwege bearbeiten, vergleichen oder passende Alternativen finden können.
- Mache Wunschliste, Fahrwerk und Einkauf leicht erreichbar. Auf Mobilgeräten eine übersichtliche Navigation ohne horizontale Tab-Wüste.

Sinnvolle Hauptziele sollen mit höchstens ein bis zwei Navigationstaps erreichbar sein. Erforderliche fachliche Angaben bleiben erhalten.

## 4. Teile finden: eine klare Kachel und kurze Fragen

Baue im Aufbau eine deutlich erkennbare Kachel „Passendes Teil finden“. Zusätzlich gibt es dieselbe Aktion direkt an jeder Komponente. Wird sie an einer Bremse geöffnet, ist „Bremsen“ bereits vorausgewählt.

Öffne einen kompakten Dialog beziehungsweise ein Bottom Sheet:

1. Was suchst du? Zum Beispiel Bremse, Gabel, Dämpfer oder Laufräder.
2. Was möchtest du verbessern? Kategorieabhängige Auswahl wie Bremskontrolle, Verhalten bei langen Abfahrten, Gewicht, Wartung oder ein defektes Teil ersetzen.
3. Welche Marke? Bestimmte Marke, mehrere Marken oder „Marke egal“.
4. Preisrahmen: „Budget festlegen“ mit Betrag oder „Preis offen“.

Berücksichtige das aktive Rad, vorhandene Komponenten und den Einsatz automatisch. Frage nur noch fehlende relevante Angaben ab. Budget gilt für die vollständige notwendige Lösung inklusive erforderlichem Zubehör. Wünsche lassen sich später direkt ändern.

Zeige zuerst ungefähr drei passende Ergebnisse statt einer langen ungefilterten Liste. Weitere Ergebnisse sind erreichbar. Jede Kachel enthält Produktbild, exakte Variante, Gesamtpreis, Kompatibilitätsstatus, nachvollziehbaren Nutzen und mögliche Nachteile.

Aktionen: „Vergleichen“, „Merken“, „Im Aufbau ersetzen“ und „Zum Produkt“. Diese Aktionen müssen tatsächlich funktionieren.

## 5. Sinnvolle Empfehlungen statt billigerer Rückschritte

Vergleiche immer mit dem tatsächlich verbauten beziehungsweise geplanten Teil am aktiven Rad. Technische Passform allein bedeutet nicht, dass ein Teil ein Upgrade ist.

Im geprüften Beispiel stehen eine RockShox Recon als Sparalternative zur Pike Ultimate und Shimano MT420 zur XT M8120. Solche Vorschläge dürfen den normalen Upgrade-Weg nicht dominieren.

- Empfehle standardmäßig nur Teile, die das gewählte Ziel nachvollziehbar verbessern.
- Ein niedrigerer Preis ist kein Leistungsupgrade.
- Wenn das aktuelle Teil schon gut passt, sage verständlich: „Dein aktuelles Teil passt gut. Für dein Ziel sehen wir derzeit keinen überzeugenden Wechsel.“
- Günstigere Ersatzteile erscheinen nur auf ausdrücklichen Wunsch in einem eigenen Modus. Zeige ihre Einschränkungen.
- Bewerte reale Eigenschaften und den konkreten Einsatz; weder Markenname noch Preis allein entscheiden.
- Ein Teil kann in einer Eigenschaft besser und in einer anderen schlechter sein. Zeige diese Abwägung offen.
- Vermeide erfundene Leistungswerte, pauschale Punktegewinne und unbelegte Aussagen.

Begründe die Empfehlung aus überprüfbaren Spezifikationen, passenden Herstellerangaben und belastbaren Quellen. Trenne belegte Fakten, Einschätzungen und unbekannte Angaben.

## 6. Adapter und notwendiges Zubehör automatisch auswählen

Beim Austausch einer Bremse oder Änderung der Scheibengröße wird der korrekte erforderliche Adapter automatisch vorgeschlagen und dem geplanten Aufbau zugeordnet.

Prüfe Vorder- und Hinterrad getrennt: Aufnahme an Rahmen/Gabel und Bremssattel, native Scheibengröße, gewünschte Scheibe, Herstellerfreigaben und Grenzwerte. Nutze exakte Modellvarianten und Hersteller-Kompatibilitätstabellen. Ein Markenwechsel allein verlangt nicht zwangsläufig einen neuen Adapter.

Prüfe außerdem Scheibenaufnahme, Scheibendicke, Belagverträglichkeit, Befestigung sowie gegebenenfalls passende Leitungsanschlüsse. Entscheide korrekt zwischen „kein Adapter nötig“, „vorhandenen Adapter weiterverwenden“, „neuer Adapter nötig“ und „Angaben fehlen“.

Zeige eine kurze Erklärung: „Dieser Adapter wird wegen … benötigt.“ Preis und Gewicht des Zubehörs fließen in Vergleich und Einkauf ein. Entferne überflüssige geplante Adapter beim erneuten Wechsel, ohne doppelte Artikel zu erzeugen oder die Historie verbauter Teile zu verlieren.

Fehlen entscheidende Daten, stelle eine gezielte Rückfrage. Erfinde keine Passform und bestätige unbekannte Kombinationen nicht automatisch.

Übertrage dieses Prinzip auf weitere Abhängigkeiten wie Freilauf/Kassette, Innenlager/Kurbel und Lenker/Vorbau. Änderungen werden als nachvollziehbares Paket mit Rückgängig-Funktion übernommen.

## 7. Exakte Produktlinks und belastbarer Preisvergleich

Die derzeit sichtbaren Suchlinks erfüllen diesen Auftrag nicht. „Zum Produkt“ muss zur konkreten Produktdetailseite führen, möglichst bereits zur passenden Variante.

Prüfe Modell, Modelljahr, Größe, Ausführung, Lieferumfang, Verfügbarkeit und Versandziel. Bei Bremsen ausdrücklich zwischen einzelner Vorder-/Hinterradbremse und vollständigem Set unterscheiden.

Vergleiche tatsächlich lieferbare identische Varianten. Berücksichtige Mehrwertsteuer, bekannten Versand und notwendige Adapter beziehungsweise Zubehörteile. Zeige Händler, Preisstand und vollständige Kosten transparent.

Formuliere „Günstigstes geprüftes Angebot“ mit Umfang des Vergleichs; behaupte keinen weltweit besten Preis. Ist Versand unbekannt, kennzeichne das. Provisionen beeinflussen die Reihenfolge nicht; Affiliate-Angebote werden klar markiert.

Keine erfundenen URLs oder Livepreise, keine Shop-Startseiten oder Suchergebnisse als Produktlink. Ohne verifiziertes Angebot zeige „Derzeit kein geprüftes Angebot“ und ermögliche Merken.

Implementiere eine echte Datenversorgung, sofern erforderlich mit Backend beziehungsweise geplantem Aktualisierungsprozess. Ein statischer Prototyp darf aktuelle Marktpreise nicht simulieren. Veraltete Angebote, defekte Links und fehlende Varianten erhalten funktionierende Zustände.

## 8. Wunschliste und vorhandene Teile klar trennen

Jedes Rad besitzt einen gespeicherten Bestand und eine eigene Wunschliste. So weiß die App, was bereits montiert ist und was gewünscht wird.

„Merken“ funktioniert direkt an einem Vorschlag. Nutzer können außerdem Kategorie und Wunschmodell oder Produktlink eintragen. Nur notwendige Angaben abfragen.

Ein Wunsch ersetzt kein verbautes Teil. „Im Aufbau testen“, „Zur Einkaufsliste“ und „Als verbaut übernehmen“ sind getrennte Schritte. Zeige Ziel, Budget, geprüften Preis, Passform und Zubehör. Wünsche und Bestände bleiben nach Neuladen erhalten und vermischen sich nicht zwischen Rädern.

## 9. Vergleich verständlich darstellen

Jeder Wechsel erhält einen direkten Vorher-Nachher-Vergleich:

- Was verbessert sich konkret für mein Ziel?
- Was wird schlechter oder bleibt gleich?
- Welche Daten fehlen?
- Was kostet die vollständige Änderung?
- Welches Zubehör muss mitgewechselt werden?

Nutze kurze Aussagen und eine übersichtliche Tabelle mit identischen Vergleichsgrundlagen. Zahlen nur bei belastbaren Daten. Nutzer müssen die Entscheidung verstehen können, ohne technische Recherche zu übernehmen.

## 10. Hochwertiges 3D mit Blender

Nutze Blender für Modellierung und Rendering. Verbessere das derzeit eher schematische Rad durch realistische Proportionen, Geometrie, Materialien, Beleuchtung und saubere Details.

Das Beispielrad soll sich am Propain Spindrift 5 AL orientieren. Prüfe offizielle Referenzen zu Rahmenform, Hinterbau, Dämpferposition und Laufradkonfiguration. Modelliere wichtige Teile modular, damit ein Komponentenwechsel visuell nachvollziehbar ist.

Liefere bearbeitbare .blend-Dateien, optimierte GLB-Dateien und hochwertige Vorschaurenderings. Lade das Modell bedarfsgerecht und verwende ein schnelles Bild als Fallback. Das Rad darf die Bedienung nicht verzögern. Generische Komponenten dürfen nicht als maßgetreue Modelle konkreter Produkte ausgegeben werden.

## 11. Onboarding mit kurzem, ehrlichem Einstieg

Zeige in höchstens zwei bis drei kurzen, jederzeit überspringbaren Szenen den Nutzen:

„Ohne Überblick“: Eine beispielhafte Teilekombination braucht zusätzliches Zubehör oder passt nicht.
„Mit CrankScore“: Die App erkennt den dokumentierten Konflikt und zeigt eine passende Lösung mit vollständigen Kosten.

Formuliere etwa „Dein Rad. Passende Teile. Klarer Plan.“ statt übertriebener Versprechen. Zeige einen realistischen Vorteil durch gute Animation und verständliche Beispiele. Keine erfundenen Ersparnisse, Angstmache, Zwangsregistrierung oder ständig wiederkehrende Werbung.

Trenne diese kurze Einführung von der eigentlichen Einrichtung. Für ein bestehendes Rad müssen Nutzer keinen kompletten Neubau konfigurieren. Bereits erfasste Angaben werden übernommen; der Einstieg ist beim nächsten Öffnen abgeschlossen.

## 12. Animationen und überprüfbarer Abschluss

Implementiere dezente Animationen für Hell/Dunkel-Wechsel, aufklappbare Prüfung, Bottom Sheets, Teilewechsel, Wunschlistenfeedback und Onboarding. Sie sollen Orientierung geben und sich schnell anfühlen.

Vermeide Blitze, Layoutsprünge, lange Wartezeiten und dauernd neu startende Score-Animationen. Berücksichtige prefers-reduced-motion, Tastaturbedienung, Fokusführung und Touch-Ziele.

Arbeite in überprüfbaren Schritten: Bestand analysieren, Designsystem und Nutzerwege festlegen, implementieren, im Browser prüfen und gefundene Mängel beheben. Höre nicht nach dem ersten Entwurf auf.

Der Auftrag ist erst abgeschlossen, wenn:
- Prüfung als aufklappbarer Bereich zwischen Radbild und Rahmen funktioniert.
- Teileauswahl, Ziele, Marken und Budget die Ergebnisse tatsächlich verändern.
- Gute vorhandene Teile keine unbegründeten Downgrades erhalten.
- Adapter korrekt behandelt werden, inklusive unbekannter Angaben und Grenzfälle.
- Produktbuttons zu verifizierten passenden Produktseiten führen.
- Vergleich, Wunschliste, Speicherung und Rückgängig funktionieren.
- Onboarding kurz, überspringbar und dauerhaft abgeschlossen ist.
- Deutsch/Englisch, Hell/Dunkel und reduzierte Bewegung geprüft sind.
- Die Kernwege bei 390 px Mobilbreite und auf Desktop verständlich und ohne Überläufe funktionieren.
- Keine relevanten neuen Konsolenfehler oder Regressionen bestehen.

Teste außerdem: gute Bremse ohne sinnvolles Upgrade, begrenztes Budget, markenoffene Suche, notwendiger beziehungsweise unnötiger Adapter, fehlende Spezifikationen, nicht lieferbares Angebot und mehrere Radprofile.

„Perfekt“ bedeutet hier, diese Kriterien nachweisbar zu erfüllen. Wiederhole Prüfung und Verbesserung bis dahin. Falls ein externer Zugang oder eine belastbare Datenquelle fehlt, benenne den konkreten Blocker und liefere keinen vorgetäuschten Erfolg.

Schreibe zum Abschluss automatisch in unseren Austauschordner: Änderungen, verwendete Werkzeuge, Prüfungen, Screenshots beziehungsweise Dateiverweise, offene Punkte und echte Blocker. Lies vor späteren Aufträgen den neuesten Stand. Falls kein gemeinsamer Ordner zugänglich ist, stelle eine klar benannte Austauschdatei bereit und behaupte keine automatische Kommunikation mit einer anderen KI.
