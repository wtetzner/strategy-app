
window.renderer = (function () {

  var strategyNames = {
    oo: "Split Push",
    os: "Jungle Control",
    ss: "Flex Strat",
    sh: "Wombo Combo",
    ho: "Gank Master",
    hh: "Snowball"
  };

  var colors = {
    oo: "url(#gradient-oo-bar)",
    os: "url(#gradient-os-bar)",
    ss: "url(#gradient-ss-bar)",
    sh: "url(#gradient-sh-bar)",
    ho: "url(#gradient-ho-bar)",
    hh: "url(#gradient-hh-bar)"
  };

  var strategyBarWidth = 0;
  var minStrategyBarWidth = 155;
  var allyStrategyBarLeft = 0;
  var enemyStrategyBarRight = 0;

  state.champions.map(function (champion) {
    var img = new Image();
    img.src = champion.image;
  });

  function asAList(obj) {
    var array = [];
    for (var key in obj) {
      array.push([key, obj[key]]);
    }
    return array;
  }

  this.compare = function (a,b) {
    if (a < b) {
      return -1;
    } else if (a > b) {
      return 1;
    } else {
      return 0;
    }
  };

  function sortBy(array, keyFn) {
    array.sort(function (a,b) {
      return compare(keyFn(a), keyFn(b));
    });
    return array;
  }

  function renderStrategyBars(state) {
    function emptyScores() {
      return { oo: 0, os: 0, ss: 0, sh: 0, ho: 0, hh: 0 };
    }

    function calculateStrategyScores(champions) {
      var scores = emptyScores();
      var empty = emptyScores();

      if(champions && champions.length > 0) {
        for(
          var championIndex = 0, champion = champions[championIndex];
          championIndex < champions.length;
          championIndex++, champion = champions[championIndex]
        ) {
          for(var score in scores) {
            scores[score] += champion[score] || empty[score];
          }
        };
      }
      return scores;
    }

    this.computeStaticScores = function (strategy) {
      if (strategy){
        return state.strategies[strategy];
      } else {
        return { oo: 1, os: 1, ss: 1, sh: 1, ho: 1, hh: 1 };
      }
    };

    this.scoreList = function (champions, strategy) {
      var champScores = calculateStrategyScores(champions);
      var staticScores = computeStaticScores(strategy);
      var data = {};
      for (var key in champScores) {
        data[key] = { value: champScores[key], strategyValue: 6 - staticScores[key] };
      }
      var results = asAList(data);
      sortBy(results, function (data) {
        return data[1].value;
      });
      results.reverse();
      return results;
    };

    function renderBars() {
      function barWidth(maxValue) {
        return function (score) {
          return minStrategyBarWidth + (((strategyBarWidth - minStrategyBarWidth) * score[1].strategyValue) / (maxValue + 0.0));
        };
      }

      function barColor(score) {
        var key = score[0];
        return colors[key];
      }

      var darkBorder = "#252e40";
      var whiteBorder = "#FFFFFF";

      if (state.current.strategySelection.ally != null) {
        var list = scoreList(state.enemyChampions(), state.current.strategySelection.ally.strategy);
        d3.selectAll('.enemy-strategy-bar')
          .data(list)
          .transition()
          .attr("width", barWidth(5))
          .attr("fill", barColor)
          .attr("stroke", function (score) {
            if (state.current.strategySelection.enemy.strategy === score[0]) {
              return whiteBorder;
            }
            return darkBorder;
          })
          .attr("onclick", function (score) {
            return "renderer.clickStrategy('enemy', '" + score[0] + "')";
          });

        d3.selectAll('.enemy-strategy-text')
          .data(list)
          .transition()
          .attr("x", function (score) {
            return enemyStrategyBarRight - (strategyBarWidth - barWidth(5)(score)) - 4;
          })
          .text(function (score) {
            return strategyNames[score[0]];
          });

        d3.selectAll('.enemy-percent-text')
          .data(list)
          .transition()
          .text(function (score) {
            return score[1].value * 4;
          });
      } else {
        var list = scoreList(state.enemyChampions(), state.current.strategySelection.ally.strategy);
        d3.selectAll('.enemy-strategy-bar')
          .data(list)
          .transition()
          .attr("width", strategyBarWidth)
          .attr("fill", barColor)
          .attr("onclick", function (score) {
            return "renderer.clickStrategy('enemy', '" + score[0] + "')";
          });
      }

      if (state.current.strategySelection.enemy != null) {
        var list = scoreList(state.allyChampions(), state.current.strategySelection.enemy.strategy);
        d3.selectAll('.ally-strategy-bar')
          .data(list)
          .transition()
          .attr("width", barWidth(5))
          .attr("fill", barColor)
          .attr("stroke", function (score) {
            if (state.current.strategySelection.ally.strategy === score[0]) {
              return whiteBorder;
            }
            return darkBorder;
          })
          .attr("x", function (score) {
            return (strategyBarWidth + allyStrategyBarLeft) - barWidth(5)(score);
          })
          .attr("onclick", function (score) {
            return "renderer.clickStrategy('ally', '" + score[0] + "')";
          });

        d3.selectAll('.ally-strategy-text')
          .data(list)
          .transition()
          .attr("x", function (score) {
            return (strategyBarWidth + allyStrategyBarLeft) - barWidth(5)(score) + 4;
          })
          .text(function (score) {
            return strategyNames[score[0]];
          });

        d3.selectAll('.ally-percent-text')
          .data(list)
          .transition()
          .text(function (score) {
            return score[1].value * 4;
          });
      } else {
        var list = scoreList(state.allyChampions(), state.current.strategySelection.enemy.strategy);
        d3.selectAll('.ally-strategy-bar')
          .data(list)
          .transition()
          .attr("width", strategyBarWidth)
          .attr("fill", barColor)
          .attr("x", allyStrategyBarLeft)
          .attr("onclick", function (score) {
            return "renderer.clickStrategy('ally', '" + score[0] + "')";
          });

        d3.selectAll('.ally-strategy-text')
          .data(list)
          .transition()
          .attr("x", function (score) {
            return (strategyBarWidth + allyStrategyBarLeft) - strategyBarWidth + 4;
          })
          .text(function (score) {
            return strategyNames[score[0]];
          });
      }
    }
    renderBars();
  }

  function renderChampionFrames(kind, champions) {
    function barWidth(champion, variable) {
      return (166 * (champion.data[variable] | 0)) / 5;
    }

    var enemy_box = document.getElementById("enemy-top-bar-container");
    var enemy_right = (enemy_box.getAttribute("x") | 0) + (enemy_box.getAttribute("width") | 0) - 2;

    function renderBars(variable) {
      d3.selectAll('.' + kind + '-bar.champion-bar-' + variable)
        .data(champions)
        .transition()
        .attr("width", function (champion) {
          return barWidth(champion, variable);
        });

      if (kind === 'enemy') {
        d3.selectAll('.enemy-bar.champion-bar-' + variable)
          .data(champions)
          .transition()
          .attr("width", function (champion) {
            return barWidth(champion, variable);
          })
          .attr("x", function (champion) {
            return enemy_right - barWidth(champion, variable);
          });
      }
    }

    renderBars('oo');
    renderBars('os');
    renderBars('ss');
    renderBars('sh');
    renderBars('ho');
    renderBars('hh');

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
      var textMatches = champion.name.toLowerCase().indexOf(state.current.appState.championName.toLowerCase()) !== -1;
      if (!textMatches) return false;
      if (state.current.appState.kind === 'ally') {
        return !state.isAlly(champion.name);
      } else {
        return !state.isEnemy(champion.name);
      }
    }

    var champs = state.champions.filter(function (champion) {
      if (state.current.appState.id === "select-champion") {
        if (where(champion)) {
          return true;
        }
      }
      return false;
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
        championName: "",//championName,
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
        if (state.current.appState.id === "select-champion") {
          if (e.which === 8) {
            return removeLast() || false;
          }
          if ($('.' + kind + '-name-' + position.toLowerCase()).text().length < state.championNameMaxSize) {
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
        if (state.current.appState.id === "select-champion") {
          if (e.which === 8) {
            return removeLast() || false;
          } else if (e.which === 13) {
            if (state.current.appState.champions.length > 0) {
              selectChampion(state.current.appState.kind, state.current.appState.position, state.current.appState.champions[0].name);
              return true;
            }
          } else if (e.which === 27) {
            state.current.appState = { id: "normal" };
            render(state);
            return true;
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
  }

  function renderChampionSelection(state) {
    if (state.current.appState.id === "select-champion") {
      prepareChampionSelectionBox(state);
      window.setTimeout(function () { $("#champion-select-frame").css("display", "block"); }, 1);
    } else {
      $("#champion-select-frame").css("display", "none");
    }
  }

  function render(state) {
    renderChampionSelection(state);
    renderChampionFrames('ally', state.current.allies);
    renderChampionFrames('enemy', state.current.enemies);
    renderStrategyBars(state);
  }

  this.clickStrategy = function (kind, strategyId) {
    state.selectStrategy(kind, strategyId);
    render(state);
  };

  window.onload = function () {
    strategyBarWidth = parseInt($('#ally-oo-strategy-bar').attr("width"));
    allyStrategyBarLeft = parseInt($('#ally-oo-strategy-bar').attr("x"));
    enemyStrategyBarRight = parseInt($('#enemy-oo-strategy-bar').attr("x")) + parseInt($('#enemy-oo-strategy-bar').attr("width"));
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
