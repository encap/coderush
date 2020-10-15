![Build and update][build-shield]
![Deploy to CDN][deploy-shield]
[![Website status][website-shield]][main-url]
![Dependecies Status][deps-shield]
[![GitHub issues][issues-shield]][issues-url]
[![GPLv3 License][license-shield]][license-url]
[![Ask Me Anything !][ama-shield]][email-link]
![Open Source? Yes!][os-shield]

<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://coderush.herokuapp.com">
    <img src=".github/images/logo.webp" alt="Logo" width="256" height="256">
  </a>

  <h1 align="center">CodeRush</h1>

  <p align="center">
    The best speed typing app for programmers
    <br />
    <br />
    <a href="https://coderush.herokuapp.com">View live</a>
    ·
    <a href="https://github.com/encap/coderush/issues">Report Bug</a>
    ·
    <a href="https://github.com/encap/coderush/issues">Request Feature</a>
  </p>
</p>


# XIII MFI - WAŻNE INFORMACJE 
## Instrukcja pobierania kodu źródłowego w formacie ZIP
https://github.com/encap/coderush
![zip download instruction](.github/images/download_zip.png?raw=true)

## Opis struktury plików
### Wszystkie pliki zostały napisane w 100% przeze mnie chyba że napisano inaczej
* .github/
  * workflows/ - skrypty do automatycznego przetwarzania statystyk, kontrybucji w postaci przykładowych kodów, proces kompilacji i wysyłania na serwer CDN (rozproszony system dostarczania treści) i jego konfiguracji
  * images/ - przechowuje zdjęcia i grafiki zawarte w tym dokumencie
* actions/ - skrypty pomocnicze wykonywane podczas skryptów z katalogu .github/workflows/
* node_modules/ - tworzony podczas lokalnej instalacji (npm install) zewnętrznych bibliotek wykorzystywanych w CodeRush
* dist/ - generowany podczas kompilacji i "pakowania", zawiera skompresowane pliki CSS, JS i HTML
* public/
  * cm/ - moduły biblioteki CodeMirror, zmodyfikowane przeze mnie dla lepszej wydajności i skompresowane
  * code/ - kody wykorzystywany podczas testu pisania, kod (poza C++, HTML, JS, CSS, PHP, VUE) nie jest mojego autorstwa (licencja MIT). Skrócony, sformatowany i sprawdzany przeze mnie. Do tego folderu po sprawdzeniu trafiają także kontrubucje ze strony https://coderush.herokuapp.com/contribute
* server/
  * database.json - publicznie dostępna baza danych ze statystykami i opisem kodów do testów generowana przez serwer bądź w.w skrypty
  * rooms.js - logika serwera do obsługi trybu wieloosobowego
  * server.js - główny plik wykonawczy serwera (obsługa zapytań, caching, obsługa statystyk i kontrybucji itd.)
* src/ - kod źródłowy aplikacji (front-end'u)
  * components/ oraz views/ - modułowe komponenty z których zbudowany jest interfejs wraz z logiką napisaną w Vue, JavaScript (ES9)
  * router/ - konfiguracja routingu aplikacji Vue (single page application)
  * store/ - konfiguracja, logika i stan początkowy scentralizowanego magazynu danych całej apliakcji i synchronizacji danych między komponentami
  * styles/ - globalne style wykorzystywane we wszystkich komponentach, napisane w składni SASS (preprocesor CSS)
  * App.vue - główny plik aplikacji Vue
  * cmLoader.js - ładuje moduły edytora kodu na żądanie, napisany przeze mnie na podstawie statycznego loadera dostępnego w repozytorium biblioteki CodeMirror
  * main.js - główny plik wykonawczy i konfiguracyjny aplikacji Vue
* vue.config.js oraz webpack.config.js - pliki konfiguracyjne procesu kompilacji i pakowania
* package-lock.json - plik wygenerowany przez package-manager podczas instalacji (npm install)
* package.json - tak jak wyżej + skrypty napisane przeze mnie
* pozostałe pliki - inne pliki konfiguracyjne napisane przeze mnie

## Wykorzystywane bilbioteki zewnętrzne
### Wszystkie na licencji MIT, chyba że napisano inaczej
* [Vue.js 2](https://vuejs.org/) - framework JS wykorzystywany po stronie klienta
* [CodeMirror 5](https://codemirror.net/) - edytor kodu
* [Chart.js 2](https://www.chartjs.org/) - biblioteka do generowania wykresów
* [Express 4](https://expressjs.com/) - framework JS wykorzystywany na serwerze do obsługi zapytań
* [Socket.io 2](https://socket.io/) - biblioteka do komunikacji w czasie rzeczywistym oparta o protokół WebSocket
* [Webpack 4](https://webpack.js.org/) - przetwarza kod i "pakuje" go w pliki dostarczane do użytkowników
* [Font Awesome 5](https://fontawesome.com/) - ikony widoczne w aplikacji; kod biblioteki na licencji MIT, ikony na licencji CC BY 4.0

# Pozostała część dokumentacji projektu open-source

<!-- TABLE OF CONTENTS -->
## Table of Contents

* [About the Project](#about-the-project)
  * [Built With](#built-with)
* [Getting Started](#getting-started)
  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
* [Usage](#usage)
* [Roadmap](#roadmap)
* [Contributing](#contributing)
* [License](#license)
* [Contact](#contact)



<!-- ABOUT THE PROJECT -->
## About
CodeRush allows you to test your writing skills in more than 30 most popular technologies and 3 diffrent game modes. 

[![Product Name Screen Shot][main-screenshot]][main-url]

In addition to calculating your CPM (characters per minute), it provides you with detailed statistics for example the most frequently miss-clicked keys, so that You will pay attention to them in the future.

Example results:
[![Product Name Screen Shot][results-screenshot]][main-url]

### Multiplayer mode
On CodeRush you can create a private multiplayer server, so that you can compete with invited friends and colleagues.


### Built With

* [Passion and love :heart:](https://coderush.herokuapp.com/about)
* [Vue.js 2](https://vuejs.org/)
* [CodeMirror 5](https://codemirror.net/)
* [Chart.js 2](https://www.chartjs.org/)
* [Node.js 12](https://nodejs.org/en/)
* [Express 4](https://expressjs.com/)
* [Socket.io 2](https://socket.io/)


## Getting Started

To get a local copy up and running follow these simple steps.

## Usage

App is up (I hope) and running on https://coderush.herokuapp.com.You can also start a local server as shown below.


### Prerequisites

* Node.js 12
* Git
* NPM or other package manager


### Installation and local development

1. Clone the repo
```sh
git clone https://github.com/encap/coderush.git
```
2. Install NPM packages
```sh
npm install
```
3. Start Vue dev server and API server (on :3000)
```sh
npm run dev
```

Check out package.json for other useful scripts

## Roadmap

See the [this page][issues-url] for a list of proposed features (and known issues) that I will implement (and fix) in the near future.


## Contributing

CodeRush is a one-person project but as long as I will have time, I will make changes to the code myself, so please do not create pull requests unless it is an critical bugfix.

You can still propose new features and report issues like in most open source projects and it will be appreciated.

#### UPDATE:

You can now submit code examples on which our users will test their typing skills. How to do it?

1. Go to [this page][contribute-url] (tab "Contribute" on CodeRush website)
2. Enter your name (nick)
3. Paste or write code in avaible editor
    * Select a language if you haven't already done it
    * Choose a tab size
3. Give your code a brief description or name (e.g function name)
4. Click Send

Assuming your code passes all our tests it will be waiting for human verification as a pull request [here][pulls-url].

## License

I made CodeRush open source becouse without other OS projects I wouldn't be able to get to the point where I am now.

Source code is distributed under the [GNU GPL v3][license-url] License. However, I would advise against looking here for the best solutions or forking it becouse this was my first Vue.js project.


## Contact
Łukasz Wielgus

Poland

encapsulation4@gmail.com


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[license-shield]: https://img.shields.io/badge/License-GPL%20v3-yellow.svg
[license-url]: https://www.gnu.org/licenses/gpl-3.0.en.html
[website-shield]: https://img.shields.io/website-up-down-green-red/https/coderush.herokuapp.com.svg
[ama-shield]: https://img.shields.io/badge/Ask%20me-anything-1abc9c.svg
[email-link]: 'mailto:encapsulation4@gmail.com?subject=[GitHub]%20'
[main-url]: https://coderush.herokuapp.com
[contribute-url]: https://coderush.herokuapp.com/contribute
[pulls-url]: https://github.com/encap/coderush/pulls
[issues-url]: https://github.com/encap/coderush/issues
[issues-shield]: https://img.shields.io/github/issues/encap/coderush
[deps-shield]: https://david-dm.org/encap/coderush.svg
[main-screenshot]: .github/images/main-screenshot.webp
[results-screenshot]: .github/images/results-screenshot.webp
[deploy-shield]: https://github.com/encap/coderush/workflows/Deploy%20to%20CDN/badge.svg
[build-shield]: https://github.com/encap/coderush/workflows/Vue%20build%20and%20update%20stats/badge.svg
[os-shield]: https://badgen.net/badge/Open%20Source%20%3F/Yes%21/blue?icon=github