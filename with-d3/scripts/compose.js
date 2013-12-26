
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
        return champion.data.name;
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

  this.openSelection = function (kind, position) {
    if (state.current.appState.id !== "select-champion") {
      state.current.appState = {
        id: "select-champion",
        kind: kind,
        position: position
      };
      render(state);
    }
  };

  function prepareChampionSelectionBox(state) {
    var rect = document.getElementById('champion-select-rect');
    var rectX = rect.getAttribute("x") | 0; //$('#champion-select-rect').attr('x') | 0;
    var rectY = rect.getAttribute("y") | 0; //8; //$('#champion-select-rect').attr('y') | 0;

    d3.select("#champion-select-frame").selectAll("image")
      .data(state.champions)
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
  }

  function renderChampionSelection(state) {
    if (state.current.appState.id === "select-champion") {
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
    prepareChampionSelectionBox(state);
    // state.champions.map(function (champion) {
    //   var image = new Image();
    //   image.src = champion.image;
    // });
    render(state);
  };

  return this;
})();
