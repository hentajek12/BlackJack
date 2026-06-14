let talia = [];
let rekaGracza = [];
let rekaKrupiera = [];
let zetony = 500;
let zaklad = 0;
let wygrane = 0;
let przegrane = 0;

const kolory = ['♠', '♥', '♦', '♣'];
const wartosci = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function stworzTalie() {
    talia = [];
    for (let k of kolory) {
        for (let w of wartosci) {
            talia.push({ kolor: k, wartosc: w });
        }
    }
    // tasowanie Fisher-Yates
    for (let i = talia.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [talia[i], talia[j]] = [talia[j], talia[i]];
    }
}

function pobierzKarte() {
    if (talia.length < 10) stworzTalie();
    return talia.pop();
}

function liczPunkty(reka) {
    let suma = 0;
    let asy = 0;
    for (let karta of reka) {
        if (karta.wartosc === 'A') { suma += 11; asy++; }
        else if (['J', 'Q', 'K'].includes(karta.wartosc)) suma += 10;
        else suma += parseInt(karta.wartosc);
    }
    // As może być 1 lub 11
    while (suma > 21 && asy > 0) { suma -= 10; asy--; }
    return suma;
}

function stworzKarte(karta, zakryta = false) {
    const div = document.createElement('div');
    if (zakryta) {
        div.classList.add('karta', 'zakryta');
        return div;
    }
    const czyRed = (karta.kolor === '♥' || karta.kolor === '♦');
    div.classList.add('karta', czyRed ? 'czerwona' : 'czarna');

    const gora = document.createElement('span');
    gora.classList.add('karta-gora');
    gora.textContent = karta.wartosc + karta.kolor;

    const srodek = document.createElement('span');
    srodek.classList.add('karta-srodek');
    srodek.textContent = karta.kolor;

    const dol = document.createElement('span');
    dol.classList.add('karta-dol');
    dol.textContent = karta.wartosc + karta.kolor;

    div.appendChild(gora);
    div.appendChild(srodek);
    div.appendChild(dol);
    return div;
}

function odswiez(zakryjKrupiera = false) {
    const pojemnikGracza   = document.getElementById('karty-gracza');
    const pojemnikKrupiera = document.getElementById('karty-krupiera');
    pojemnikGracza.innerHTML = '';
    pojemnikKrupiera.innerHTML = '';

    for (let karta of rekaGracza)
        pojemnikGracza.appendChild(stworzKarte(karta));

    for (let i = 0; i < rekaKrupiera.length; i++)
        pojemnikKrupiera.appendChild(stworzKarte(rekaKrupiera[i], zakryjKrupiera && i === 1));

    document.getElementById('wynik-gracza').textContent    = liczPunkty(rekaGracza);
    document.getElementById('wynik-krupiera').textContent  = zakryjKrupiera ? '?' : liczPunkty(rekaKrupiera);
    document.getElementById('wyswietl-zetony').textContent   = zetony;
    document.getElementById('wyswietl-zaklad').textContent   = zaklad;
    document.getElementById('wyswietl-wygrane').textContent  = wygrane;
    document.getElementById('wyswietl-przegrane').textContent = przegrane;
}

function ustawStatus(tekst, typ = '') {
    const el = document.getElementById('status');
    el.textContent = tekst;
    el.className = typ;
}

function pokazSekcje(nazwa) {
    document.getElementById('sekcja-zakladu').style.display = 'none';
    document.getElementById('sekcja-gry').style.display     = 'none';
    document.getElementById('sekcja-konca').style.display   = 'none';
    document.getElementById('sekcja-' + nazwa).style.display = 'block';
}

function dodajDoZakladu(kwota) {
    if (zaklad + kwota > zetony) { ustawStatus('Nie masz tyle żetonów!'); return; }
    zaklad += kwota;
    document.getElementById('info-zakladu').textContent = 'Zakład: ' + zaklad + ' żetonów';
    document.getElementById('przycisk-rozdaj').disabled = false;
}

function wyczyscZaklad() {
    zaklad = 0;
    document.getElementById('info-zakladu').textContent = 'Zakład: 0 żetonów';
    document.getElementById('przycisk-rozdaj').disabled = true;
}

function rozdaj() {
    if (zaklad === 0) return;
    zetony -= zaklad;
    rekaGracza   = [pobierzKarte(), pobierzKarte()];
    rekaKrupiera = [pobierzKarte(), pobierzKarte()];
    pokazSekcje('gry');
    odswiez(true);

    if (liczPunkty(rekaGracza) === 21) {
        ustawStatus('Blackjack! Sprawdzamy krupiera...');
        setTimeout(() => ruchKrupiera(true), 700);
        return;
    }
    document.getElementById('przycisk-podwoj').disabled = (zetony < zaklad);
    ustawStatus('Twój ruch: dobierz kartę lub stój');
}

function dobierz() {
    rekaGracza.push(pobierzKarte());
    odswiez(true);
    const punkty = liczPunkty(rekaGracza);
    if (punkty > 21) {
        ustawStatus('Przebicie! Masz ' + punkty + ' punktów.', 'przegrana');
        zakoncRunde('przegrana');
    } else if (punkty === 21) {
        stoj();
    }
}

function stoj() {
    document.getElementById('przycisk-dobierz').disabled = true;
    document.getElementById('przycisk-stoj').disabled    = true;
    document.getElementById('przycisk-podwoj').disabled  = true;
    ruchKrupiera(false);
}

function podwoj() {
    if (zetony < zaklad) return;
    zetony -= zaklad;
    zaklad *= 2;
    rekaGracza.push(pobierzKarte());
    odswiez(true);
    if (liczPunkty(rekaGracza) > 21) {
        ustawStatus('Przebicie po podwojeniu! Masz ' + liczPunkty(rekaGracza) + ' pkt.', 'przegrana');
        zakoncRunde('przegrana');
    } else {
        stoj();
    }
}

function ruchKrupiera(graczMaBJ) {
    odswiez(false);
    function krok() {
        const punkty = liczPunkty(rekaKrupiera);
        if (punkty < 17) {
            rekaKrupiera.push(pobierzKarte());
            odswiez(false);
            setTimeout(krok, 500);
        } else {
            sprawdzWynik(graczMaBJ, punkty);
        }
    }
    setTimeout(krok, 600);
}

function sprawdzWynik(graczMaBJ, punktyKrupiera) {
    const punktyGracza = liczPunkty(rekaGracza);
    let wynik = '';

    if (graczMaBJ && punktyGracza === 21) {
        if (punktyKrupiera === 21) {
            wynik = 'remis'; ustawStatus('Remis! Obaj mają Blackjacka.', 'remis');
        } else {
            wynik = 'blackjack'; ustawStatus('🃏 Blackjack! Wygrywasz 3 do 2!', 'wygrana');
        }
    } else if (punktyGracza > 21) {
        wynik = 'przegrana';
    } else if (punktyKrupiera > 21) {
        wynik = 'wygrana'; ustawStatus('Krupier się przebił! Wygrywasz!', 'wygrana');
    } else if (punktyGracza > punktyKrupiera) {
        wynik = 'wygrana'; ustawStatus('Wygrywasz! ' + punktyGracza + ' > ' + punktyKrupiera, 'wygrana');
    } else if (punktyKrupiera > punktyGracza) {
        wynik = 'przegrana'; ustawStatus('Przegrywasz. ' + punktyKrupiera + ' > ' + punktyGracza, 'przegrana');
    } else {
        wynik = 'remis'; ustawStatus('Remis! Zwracamy zakład.', 'remis');
    }

    zakoncRunde(wynik);
}

function zakoncRunde(wynik) {
    if (wynik === 'wygrana')    { zetony += zaklad * 2; wygrane++; }
    else if (wynik === 'blackjack') { zetony += Math.floor(zaklad * 2.5); wygrane++; }
    else if (wynik === 'remis') { zetony += zaklad; }
    else                        { przegrane++; }

    odswiez(false);
    pokazSekcje('konca');

    if (zetony === 0) {
        setTimeout(() => {
            zetony = 500;
            ustawStatus('Nie masz żetonów! Dostajesz 500 na start.');
            odswiez(false);
        }, 1500);
    }
}

function nowaRunda() {
    zaklad = 0;
    rekaGracza = [];
    rekaKrupiera = [];
    document.getElementById('karty-gracza').innerHTML = '';
    document.getElementById('karty-krupiera').innerHTML = '';
    document.getElementById('wynik-gracza').textContent = '0';
    document.getElementById('wynik-krupiera').textContent = '?';
    document.getElementById('info-zakladu').textContent = 'Zakład: 0 żetonów';
    document.getElementById('przycisk-rozdaj').disabled = true;
    document.getElementById('przycisk-dobierz').disabled = false;
    document.getElementById('przycisk-stoj').disabled = false;
    odswiez(false);
    pokazSekcje('zakladu');
    ustawStatus('Postaw zakład, żeby zacząć!');
}

stworzTalie();
pokazSekcje('zakladu');