
window.renderer = (function () {

  function buildChampions(box, kind, champions) {
    var boxes = box.selectAll('div').data(champions);
    var divs = boxes.enter().append('div');

    function imageSrc(champion) {
      if (champion.data) {
        return champion.data.image;
      } else {
        return "";
      }
    }

    function championName(champion) {
      var data = champion.data || { name: "" };
      return data.name;
    }

    divs.append("h3")
      .text(function (champion) {
        return champion.kind;
      });

    divs.append("img").attr("src", imageSrc);

    function championId(champion) {
      return kind.toLowerCase() + "-" + champion.kind.toLowerCase() + "-textbox";
    }

    divs.append("input")
      .attr("id", championId)
      .attr("type", "text")
      .attr("value", championName)
      .attr("onBlur", function (champion) {
        if (kind.toLowerCase() === "ally") {
          return "renderer.selectAllyChampion('" + champion.kind + "', this.value);";
        } else {
          return "renderer.selectEnemyChampion('" + champion.kind + "', this.value);";
        }
      });
  }

  function renderChampions(box, kind, champions) {
    var boxes = box.selectAll('div').data(champions);

    function imageSrc(champion) {
      if (champion.data) {
        return champion.data.image;
      } else {
        return "";
      }
    }

    function championName(champion) {
      var data = champion.data || { name: "" };
      return data.name;
    }

    function championId(champion) {
      return kind.toLowerCase() + "-" + champion.kind.toLowerCase() + "-textbox";
    }

    boxes.transition().selectAll("img")
      .attr("class", "champion-image")
      .attr("src", imageSrc);

    boxes.transition().selectAll("input")
      .attr("value", function (champion) {
        return championName(champion);
      })
      .each(function (champion) {
        if (championId(champion)) {
          var input = document.getElementById(championId(champion));
          if (input.getAttribute('value')) {
            input.value = championName(champion);
          }
        }
      });
  }

  function render(data) {
    renderChampions(d3.select("#left-champions"), "ally", data.allies);
    renderChampions(d3.select("#right-champions"), "enemy", data.enemies);

    // d3.select('#svg-content').selectAll
  }

  function renderChampionsOld(champions) {
    d3.select("body").select("#content")
      .selectAll("div")
      .data(champions)
      .enter()
      .append("div")
      .attr("id", function (champion) {
        return "champion-" + champion.name.toLowerCase();
      })
      .classed("champion", true)
      .text(function (champion) { return champion.name; })
      .append("img")
      .attr("src", function(champion) { return champion.image; });
  }

  function nameFn(champion) {
    return champion.name;
  }

  window.onload = function () {
    buildChampions(d3.select("#left-champions"), "ally", state.current.allies);
    buildChampions(d3.select("#right-champions"), "enemy", state.current.enemies);
    render(state.current);
  };

  this.selectAllyChampion = function (kind, championName) {
    state.selectAllyChampionByName(state.current, kind, championName);
    this.update();
  };

  this.selectEnemyChampion = function (kind, championName) {
    state.selectEnemyChampionByName(state.current, kind, championName);
    this.update();
  };

  this.update = function () {
    render(state.current);
  };

  return this;
})();
