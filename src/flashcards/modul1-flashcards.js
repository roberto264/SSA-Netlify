// ============================================
// KARTEIKARTEN MODUL 1: GRUNDLAGEN
// ============================================
// Einfach Fragen und Antworten hier bearbeiten
// Format: { question: '...', answer: '...' }

export const modul1Flashcards = [
  { 
    question: 'Aus welchen drei Hauptelementen setzt sich der Schweizer Strommix zusammen?', 
    answer: 'Wasserkraft (ca. 60%), Kernenergie (ca. 30%) und neue erneuerbare Energien (ca. 5-10%).' 
  },
  { 
    question: 'Was ist die wichtigste Energiequelle im Schweizer Strommix und warum?', 
    answer: 'Wasserkraft, aufgrund der geografischen Lage mit vielen Flüssen und Bergen.' 
  },
  { 
    question: 'Welches Ziel verfolgt die Energiestrategie 2050 der Schweiz?', 
    answer: 'Eine deutliche Steigerung der erneuerbaren Energien im Strommix und die langfristige Deckung des Bedarfs ohne fossile Energien.' 
  },
  { 
    question: 'Welchen prozentualen Anteil hatten Speicherkraftwerke an der Schweizer Stromproduktion im Jahr 2021?', 
    answer: 'Der Anteil betrug 35,1%.' 
  },
  { 
    question: 'Welchen prozentualen Anteil hatten Kernkraftwerke an der Schweizer Stromproduktion im Jahr 2021?', 
    answer: 'Der Anteil betrug 28,9%.' 
  },
  { 
    question: 'Warum muss die Schweiz im Winter teilweise Strom importieren?', 
    answer: 'Weil die Wasserkraftproduktion geringer ist und Solaranlagen weniger leisten.' 
  },
  { 
    question: 'In wie viele Ebenen ist das Schweizer Stromnetz unterteilt?', 
    answer: 'Das System ist in sieben Netzebenen unterteilt.' 
  },
  { 
    question: 'Welche Funktion und Spannung hat die Netzebene 1 in der Schweiz?', 
    answer: 'Es ist das Übertragungsnetz (380/220 kV) für den Stromtransport über weite Entfernungen.' 
  },
  { 
    question: 'Was ist die Hauptaufgabe der Netzebenen 2, 4 und 6?', 
    answer: 'Die Reduzierung der Spannung mithilfe von Transformatoren für die Weiterleitung an die nächsttiefere Ebene.' 
  },
  { 
    question: 'Welche Netzebene versorgt Haushalte und Kleinunternehmen direkt mit Strom?', 
    answer: 'Netzebene 7, das lokale Verteilnetz.' 
  },
  { 
    question: 'Welche Spannungen liegen in der Netzebene 7 für Endverbraucher an?', 
    answer: 'Die Spannung liegt bei 230 V für normale Steckdosen und 400 V für dreiphasige Anschlüsse.' 
  },
  { 
    question: 'In welcher Netzebene speisen dezentrale Energiequellen wie Photovoltaikanlagen typischerweise ihren Strom ein?', 
    answer: 'In der Netzebene 7 (Lokale Verteilnetze).' 
  },
  { 
    question: 'Was ist die zentrale Schnittstelle zwischen dem öffentlichen Stromnetz und der elektrischen Installation eines Gebäudes?', 
    answer: 'Der Hausanschlusskasten (HAK).' 
  },
  { 
    question: 'Wodurch wird die maximale Leistung einer PV-Anlage, die ins Netz einspeisen kann, primär begrenzt?', 
    answer: 'Durch die Kapazität des Hausanschlusskastens (HAK) und dessen Hauptsicherungen.' 
  },
  { 
    question: 'Wie hoch ist die maximale Einspeiseleistung einer PV-Anlage bei einem typischen Hausanschluss von 25 Ampere pro Phase?', 
    answer: 'Die Obergrenze beträgt ca. 17,3 kW.' 
  },
  { 
    question: 'Welche Nennstromstärke (in Ampere) wird durch die Kennfarbe Gelb bei einer Schmelzsicherung angezeigt?', 
    answer: 'Die Kennfarbe Gelb steht für 25 Ampere.' 
  },
  { 
    question: 'Welche Nennstromstärke (in Ampere) wird durch die Kennfarbe Grau bei einer Schmelzsicherung angezeigt?', 
    answer: 'Die Kennfarbe Grau steht für 16 Ampere.' 
  },
  { 
    question: 'Welche Nennstromstärke (in Ampere) wird durch die Kennfarbe Blau bei einer Schmelzsicherung angezeigt?', 
    answer: 'Die Kennfarbe Blau steht für 20 Ampere.' 
  },
  { 
    question: 'Nennen Sie eine mögliche Lösung, wenn eine geplante PV-Anlage die Leistungsgrenze des Hausanschlusses überschreitet.', 
    answer: 'Entweder wird die PV-Anlage technisch gedrosselt oder der Hausanschluss wird aufgerüstet (z.B. auf 40 A).' 
  },
  { 
    question: 'Was ist ein Vorteil eines aussen montierten Hausanschlusskastens (HAK)?', 
    answer: 'Er bietet einfachen Zugang für den Netzbetreiber und oft kürzere Kabelwege zur PV-Anlage.' 
  },
  { 
    question: 'Was ist die Funktion des Zählerkastens im Hausnetz?', 
    answer: 'Im Zählerkasten wird der Stromverbrauch durch den Stromzähler gemessen.' 
  },
  { 
    question: 'Was versteht man unter dem Hausnetz?', 
    answer: 'Das Hausnetz beschreibt die gesamte elektrische Infrastruktur innerhalb eines Gebäudes zur Verteilung der Energie.' 
  },
  { 
    question: 'Was verteilt den Strom auf die einzelnen Stromkreise des Hauses?', 
    answer: 'Die Hauptverteilung (und ggf. Unterverteilungen).' 
  },
  { 
    question: 'Welche Spannung wird im Schweizer Hausnetz typischerweise für normale Steckdosen und Kleingeräte verwendet?', 
    answer: 'Es wird eine Niederspannung von 230 Volt verwendet.' 
  },
  { 
    question: 'Welcher Stromanschluss wird für leistungsstarke Geräte wie Kochherde oder Wärmepumpen benötigt?', 
    answer: 'Es wird Drehstrom (400 Volt) über einen dreiphasigen Anschluss benötigt.' 
  },
  { 
    question: 'Welche Schutzmassnahme im Hausnetz schützt Menschen vor elektrischen Unfällen bei Fehlerströmen?', 
    answer: 'Der Fehlerstrom-Schutzschalter (FI-Schalter).' 
  },
  { 
    question: 'Was ist die Funktion von Leitungsschutzschaltern?', 
    answer: 'Bei Überlastung oder Kurzschluss den Stromfluss in einem Stromkreis automatisch zu unterbrechen.' 
  },
  { 
    question: 'Was ist einphasiger Strom?', 
    answer: 'Der elektrische Strom wird über eine einzige Phase geleitet und hat eine Spannung von 230 V.' 
  },
  { 
    question: 'Was ist dreiphasiger Strom (Drehstrom)?', 
    answer: 'Der Strom wird über drei um 120° versetzte Phasen geleitet, was eine Spannung von 400 V zwischen den Phasen ergibt.' 
  },
  { 
    question: 'Nennen Sie zwei typische Anwendungsbeispiele für dreiphasigen Strom im Haushalt.', 
    answer: 'Kochherde, Backöfen, Wärmepumpen oder Ladestationen für Elektroautos.' 
  },
  { 
    question: 'Warum ist dreiphasiger Strom effizienter für den Betrieb von Elektromotoren?', 
    answer: 'Weil die drei Phasen eine rotierende Magnetkraft erzeugen, die den Motor gleichmässig antreibt.' 
  },
  { 
    question: 'Wie wird der dreiphasige Strom vom Hausanschluss für normale Steckdosen nutzbar gemacht?', 
    answer: 'Für normale Steckdosen (230 V) wird jeweils nur eine der drei Phasen verwendet.' 
  },
  { 
    question: 'Was ist der grundlegende Unterschied zwischen Gleichstrom (DC) und Wechselstrom (AC)?', 
    answer: 'Bei Gleichstrom fliessen die Elektronen konstant in eine Richtung, bei Wechselstrom ändern sie periodisch ihre Richtung.' 
  },
  { 
    question: 'Welche Stromart wird von Batterien, Akkus und Photovoltaikmodulen erzeugt oder geliefert?', 
    answer: 'Sie liefern Gleichstrom (DC – Direct Current).' 
  },
  { 
    question: 'Welche Stromart wird im öffentlichen Stromnetz und im Hausnetz für die meisten Geräte verwendet?', 
    answer: 'Es wird Wechselstrom (AC – Alternating Current) verwendet.' 
  },
  { 
    question: 'Mit welcher Frequenz ändert der Wechselstrom in Europa seine Richtung?', 
    answer: 'Mit einer Frequenz von 50 Hertz (Hz).' 
  },
  { 
    question: 'Welches Bauteil wird benötigt, um den von Solarmodulen erzeugten Gleichstrom ins Hausnetz einspeisen zu können?', 
    answer: 'Ein Wechselrichter, der den Gleichstrom (DC) in Wechselstrom (AC) umwandelt.' 
  },
  { 
    question: 'Was wandeln Netzteile für Laptops oder Smartphones um?', 
    answer: 'Wechselstrom (AC) aus der Steckdose in Gleichstrom (DC), den das Gerät intern benötigt.' 
  },
  { 
    question: 'Was ist der Hauptgrund, warum Wechselstrom für die Übertragung über lange Strecken effizienter ist?', 
    answer: 'Weil seine Spannung mithilfe von Transformatoren einfach erhöht oder reduziert werden kann, was Verluste minimiert.' 
  },
  { 
    question: 'In welcher Jahreszeit erreicht die Stromproduktion einer PV-Anlage in der Schweiz ihren Höhepunkt?', 
    answer: 'In den Sommermonaten, typischerweise von Mai bis Juli.' 
  },
  { 
    question: 'Zu welcher Tageszeit produziert eine Photovoltaikanlage den meisten Strom?', 
    answer: 'Zur Mittagszeit, wenn die Sonneneinstrahlung am intensivsten ist.' 
  },
  { 
    question: 'Warum besteht oft eine Diskrepanz zwischen der PV-Produktionsspitze und dem Haushaltsverbrauch?', 
    answer: 'Die Produktion ist mittags am höchsten, während die Verbrauchsspitzen oft morgens und abends liegen.' 
  },
  { 
    question: 'Welche zwei Massnahmen können helfen, den Eigenverbrauch von Solarstrom zu erhöhen?', 
    answer: 'Eine zeitliche Verschiebung des Stromverbrauchs (z.B. Geräte mittags laufen lassen) oder der Einsatz eines Batteriespeichers.' 
  }
];
