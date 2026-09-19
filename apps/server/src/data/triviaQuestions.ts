export interface TriviaQuestion {
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
}

export const TRIVIA_QUESTIONS: TriviaQuestion[] = [
  { question: 'Welcher Planet ist der Sonne am nächsten?', options: ['Venus', 'Merkur', 'Mars', 'Erde'], correctIndex: 1 },
  { question: 'Wie viele Beine hat eine Spinne?', options: ['6', '8', '10', '12'], correctIndex: 1 },
  { question: 'Welches Land hat die meisten Einwohner der Welt?', options: ['USA', 'Indien', 'China', 'Indonesien'], correctIndex: 1 },
  { question: 'Wie heißt die Hauptstadt von Australien?', options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'], correctIndex: 2 },
  { question: 'Welches Element hat das chemische Symbol "O"?', options: ['Gold', 'Sauerstoff', 'Osmium', 'Silber'], correctIndex: 1 },
  { question: 'Wie viele Herzen hat ein Oktopus?', options: ['1', '2', '3', '4'], correctIndex: 2 },
  { question: 'Welcher ist der längste Fluss der Welt?', options: ['Amazonas', 'Nil', 'Jangtsekiang', 'Mississippi'], correctIndex: 1 },
  { question: 'In welchem Jahr fiel die Berliner Mauer?', options: ['1987', '1989', '1991', '1993'], correctIndex: 1 },
  { question: 'Wie viele Saiten hat eine klassische Gitarre?', options: ['4', '5', '6', '7'], correctIndex: 2 },
  { question: 'Welches Tier ist das schnellste Landtier?', options: ['Löwe', 'Gepard', 'Gazelle', 'Pferd'], correctIndex: 1 },
  { question: 'Wie viele Zeitzonen hat Russland?', options: ['7', '9', '11', '13'], correctIndex: 2 },
  { question: 'Welches ist das kleinste Land der Welt?', options: ['Monaco', 'San Marino', 'Vatikanstadt', 'Liechtenstein'], correctIndex: 2 },
  { question: 'Wer malte die Mona Lisa?', options: ['Michelangelo', 'Leonardo da Vinci', 'Raffael', 'Botticelli'], correctIndex: 1 },
  { question: 'Wie viele Knochen hat ein erwachsener Mensch?', options: ['186', '206', '226', '246'], correctIndex: 1 },
  { question: 'Welches ist das größte Säugetier der Welt?', options: ['Elefant', 'Giraffe', 'Blauwal', 'Nashorn'], correctIndex: 2 },
  { question: 'In welcher Stadt steht der Eiffelturm?', options: ['London', 'Paris', 'Rom', 'Madrid'], correctIndex: 1 },
  { question: 'Wie viele Spieler hat eine Fußballmannschaft auf dem Feld?', options: ['9', '10', '11', '12'], correctIndex: 2 },
  { question: 'Welcher Ozean ist der größte?', options: ['Atlantik', 'Indischer Ozean', 'Pazifik', 'Arktischer Ozean'], correctIndex: 2 },
  { question: 'Wie viele Farben hat ein Regenbogen klassischerweise?', options: ['5', '6', '7', '8'], correctIndex: 2 },
  { question: 'Welches Instrument hat schwarze und weiße Tasten?', options: ['Gitarre', 'Klavier', 'Geige', 'Trompete'], correctIndex: 1 },
  { question: 'Wie heißt der höchste Berg der Welt?', options: ['K2', 'Mount Everest', 'Kilimandscharo', 'Mont Blanc'], correctIndex: 1 },
  { question: 'Welches Land schenkte den USA die Freiheitsstatue?', options: ['Großbritannien', 'Spanien', 'Frankreich', 'Italien'], correctIndex: 2 },
  { question: 'Wie viele Kontinente gibt es?', options: ['5', '6', '7', '8'], correctIndex: 2 },
  { question: 'Welches Tier gilt als bestes Gedächtnis unter Landtieren?', options: ['Elefant', 'Delfin', 'Rabe', 'Hund'], correctIndex: 0 },
  { question: 'Wie nennt man Angst vor engen Räumen?', options: ['Akrophobie', 'Klaustrophobie', 'Arachnophobie', 'Agoraphobie'], correctIndex: 1 },
  { question: 'Welcher Käse hat typische Löcher?', options: ['Gouda', 'Emmentaler', 'Feta', 'Camembert'], correctIndex: 1 },
  { question: 'Wie viele Minuten dauert ein Fußballspiel regulär?', options: ['80', '90', '100', '120'], correctIndex: 1 },
  { question: 'Welches Gas atmen Pflanzen tagsüber hauptsächlich ein?', options: ['Sauerstoff', 'Stickstoff', 'Kohlendioxid', 'Wasserstoff'], correctIndex: 2 },
  { question: 'Wie heißt das größte Organ des menschlichen Körpers?', options: ['Leber', 'Gehirn', 'Haut', 'Lunge'], correctIndex: 2 },
  { question: 'Welcher Planet wird als "Roter Planet" bezeichnet?', options: ['Jupiter', 'Mars', 'Saturn', 'Venus'], correctIndex: 1 },
];
