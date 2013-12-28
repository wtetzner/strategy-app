
window.renderer = (function () {

  state.champions.map(function (champion) {
    var img = new Image();
    img.src = champion.image;
  });

  function renderChampionFrames(kind, champions) {
    d3.selectAll("." + kind + "-image").data(champions)
      .transition()
      .attr("xlink:href", function(champion) {
        return champion.data.image;
      });
    var select_input = "." + kind + "-champion-name";
    d3.selectAll(select_input).data(champions)
      .transition()
      .text(function(champion) {
        if (state.current.appState.id === "select-champion" &&
            state.current.appState.kind.toLowerCase() === kind.toLowerCase() &&
            state.current.appState.position.toLowerCase() === champion.kind.toLowerCase()) {
          return state.current.appState.championName;
        } else {
          return champion.data.name;
        }
      });
  }

  this.selectChampion = function (kind, position, name) {
    if (kind === "ally") {
      state.selectAllyChampionByName(state.current, position, name);
    } else {
      state.selectEnemyChampionByName(state.current, position, name);
    }
    render(state);
  };

  function filteredChampions() {
    function where(champion) {
      return champion.name.toLowerCase().indexOf(state.current.appState.championName.toLowerCase());
    }
    var champs = state.champions.filter(function (champion) {
      if (state.current.appState.id === "select-champion") {
        if (where(champion) !== -1) {
          return true;
        }
      }
      return false;
    });
    champs.sort(function (a, b) {
      var av = where(a);
      var bv = where(b);
      return av - bv;
    });
    return champs;
  }

  this.openSelection = function (kind, position) {
    if (state.current.appState.id !== "select-champion") {
      var championName = $('.' + kind + '-name-' + position.toLowerCase()).text();
      state.current.appState = {
        id: "select-champion",
        kind: kind,
        position: position,
        championName: championName,
        champions: []
      };

      function removeLast() {
        var textfield = $('.' + kind + '-name-' + position.toLowerCase());
        var text = textfield.text();
        if (text.length >= 1) {
          textfield.text(text.substr(0, text.length - 1));
        } else {
          textfield.text("");
        }
        textfield.text(textfield.text());
        state.setChampionName(kind, position, textfield.text());
        render(state);
        return false;
      }

      $('body').off('keypress').on('keypress', function (e) {
        // alert(e.which);
        if (state.current.appState.id === "select-champion") {
          if (e.which === 8) {
            return removeLast() || false;
          }
          if ($('.' + kind + '-name-' + position.toLowerCase()).text().length <= 12) {
            var code = e.which || e.keyCode;
            var chr = String.fromCharCode(code);
            var textfield = $('.' + kind + '-name-' + position.toLowerCase());
            textfield.text(textfield.text() + chr);
            state.setChampionName(kind, position, textfield.text());
            render(state);
          }
        }
        return true;
      });

      $('body').off('keydown').on('keydown', function (e) {
        // alert(e.which);
        if (state.current.appState.id === "select-champion") {
          if (e.which === 8) {
            return removeLast() || false;
          } else if (e.which === 13) {
            if (state.current.appState.champions.length > 0) {
              selectChampion(state.current.appState.kind, state.current.appState.position, state.current.appState.champions[0].name);
              return true;
            }
          }
        }
        return true;
      });
    }
    render(state);
  };

  function prepareChampionSelectionBox(state) {
    var rect = document.getElementById('champion-select-rect');
    var rectX = rect.getAttribute("x") | 0;
    var rectY = rect.getAttribute("y") | 0;
    var champs = filteredChampions();
    state.current.appState.champions = champs;

    d3.select("#champion-select-frame").selectAll("image")
      .data(champs)
      .exit()
      .remove();

    d3.select("#champion-select-frame").selectAll("image")
      .data(champs)
      .enter()
      .append("image")
      .attr("x", function (champion, i) { return rectX + ((i % 11) * 64); })
      .attr("y", function (champion, i) { return rectY + ((i / 11 | 0) * 64); })
      .attr("width", 64)
      .attr("height", 64)
      .attr("xlink:href", function (champion) { return champion.image; })
      .on("click", function (champion) {
        selectChampion(state.current.appState.kind, state.current.appState.position, champion.name);
      });

    d3.select("#champion-select-frame").selectAll("image")
      .data(champs)
      .transition()
      .attr("x", function (champion, i) { return rectX + ((i % 11) * 64); })
      .attr("y", function (champion, i) { return rectY + ((i / 11 | 0) * 64); })
      .attr("width", 64)
      .attr("height", 64)
      .attr("xlink:href", function (champion) { return champion.image; });
    // .on("click", function (champion) {
    //   selectChampion(state.current.appState.kind, state.current.appState.position, champion.name);
    // });
  }

  function renderChampionSelection(state) {
    if (state.current.appState.id === "select-champion") {
      prepareChampionSelectionBox(state);
      $("#champion-select-frame").css("display", "block");
    } else {
      $("#champion-select-frame").css("display", "none");
    }
  }

  function render(state) {
    renderChampionSelection(state);
    renderChampionFrames('ally', state.current.allies);
    renderChampionFrames('enemy', state.current.enemies);
  }

  window.onload = function () {
    document.onkeydown = function(evt) {
      evt = evt || window.event;
      var keyCode = evt.keyCode;
      if (keyCode === 8) { // backspace
        return false;
      }
      return true;
    };
    prepareChampionSelectionBox(state);
    render(state);
  };

  return this;
})();
