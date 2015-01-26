# histograph-viewer

Expects [Histograph](https://github.com/erfgoed-en-locatie/histograph) to run on [http://localhost:3000/](http://localhost:3000/).

Start `histograph-viewer` with:

    python -m SimpleHTTPServer

Examples:

- Name contains _"vissen"_: [localhost](http://localhost:8000/#name=.*vissen.*), [erfgeo.nl](http://www.erfgeo.nl/hg/#name=.*vissen.*)
- URI `gemeentegeschiedenis/103` (Municipality of Amsterdam): [localhost](http://localhost:8000/#uri=gemeentegeschiedenis/103), [erfgeo.nl](http://www.erfgeo.nl/hg/#uri=gemeentegeschiedenis/103)
- Roman towns: [localhost](http://localhost:8000/#name=traiectu.), [erfgeo.nl](http://www.erfgeo.nl/hg/#name=traiectu.)
- Town of Monster: [localhost](http://localhost:8000/#name=monster), [erfgeo.nl](http://www.erfgeo.nl/hg/#name=monster)
- Three Hengelo's: [localhost](http://localhost:8000/#name=hengelo), [erfgeo.nl](http://www.erfgeo.nl/hg/#name=hengelo)