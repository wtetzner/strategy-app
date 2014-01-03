
window.renderer = (function () {

  var positions = {
    A: "Top",
    B: "Jungle",
    C: "Mid",
    D: "Carry",
    E: "Support"
  };

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

  var bar_ys = {ally: [], enemy: []};
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

  function compareBarGroups(a,b) {

  }

  function sortBarGroups(kind, scores) {
    var order = {};
    for (var i = 0; i < scores.length; i++) {
      order[scores[i][0]] = i;
    }

    var parent = $('#' + kind + '-strategy-bars');
    var capture = /^[^-]+-([^-]{2})-strategy-group$/;
    var items = parent.children('.' + kind + '-strategy-group').sort(function(a, b) {
      var strata = capture.exec($(a).attr("id"))[1];
      var stratb = capture.exec($(b).attr("id"))[1];
      var vA = order[strata];
      var vB = order[stratb];
      return vA - vB;
    });
    parent.append(items);

    d3.selectAll('.' + kind + '-strategy-group')
      .data(bar_ys[kind])
      .transition()
      .duration(500)
      .attr("transform", function (y) {
        return 'translate(0, ' + y + ')';
      });
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
      var results = asAList(data).reverse();
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

      var speed = 500;

      if (state.current.strategySelection.ally != null) {
        var list = scoreList(state.enemyChampions(), state.current.strategySelection.ally.strategy);
        sortBarGroups('enemy', list);
        d3.selectAll('.enemy-strategy-bar')
          .data(list)
          .transition()
          .duration(speed)
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

        d3.selectAll('.enemy-strategy-bar-click')
          .data(list)
          .transition()
          .duration(speed)
          .attr("onclick", function (score) {
            return "renderer.clickStrategy('enemy', '" + score[0] + "')";
          });

        d3.selectAll('.enemy-strategy-text')
          .data(list)
          .transition()
          .duration(speed)
          .attr("x", function (score) {
            return enemyStrategyBarRight - (strategyBarWidth - barWidth(5)(score)) - 4;
          })
          .text(function (score) {
            return strategyNames[score[0]];
          });

        d3.selectAll('.enemy-percent-text')
          .data(list)
          .transition()
          .duration(speed)
          .text(function (score) {
            return score[1].value * 4;
          });
      } else {
        var list = scoreList(state.enemyChampions(), state.current.strategySelection.ally.strategy);
        sortBarGroups('enemy', list);
        d3.selectAll('.enemy-strategy-bar')
          .data(list)
          .transition()
          .duration(speed)
          .attr("width", strategyBarWidth)
          .attr("fill", barColor);

        d3.selectAll('.enemy-strategy-bar-click')
          .data(list)
          .transition()
          .duration(speed)
          .attr("onclick", function (score) {
            return "renderer.clickStrategy('enemy', '" + score[0] + "')";
          });
      }

      if (state.current.strategySelection.enemy != null) {
        var list = scoreList(state.allyChampions(), state.current.strategySelection.enemy.strategy);
        sortBarGroups('ally', list);
        d3.selectAll('.ally-strategy-bar')
          .data(list)
          .transition()
          .duration(speed)
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
          });

        d3.selectAll('.ally-strategy-bar-click')
          .data(list)
          .transition()
          .duration(speed)
          .attr("onclick", function (score) {
            return "renderer.clickStrategy('ally', '" + score[0] + "')";
          });

        d3.selectAll('.ally-strategy-text')
          .data(list)
          .transition()
          .duration(speed)
          .attr("x", function (score) {
            return (strategyBarWidth + allyStrategyBarLeft) - barWidth(5)(score) + 4;
          })
          .text(function (score) {
            return strategyNames[score[0]];
          });

        d3.selectAll('.ally-percent-text')
          .data(list)
          .transition()
          .duration(speed)
          .text(function (score) {
            return score[1].value * 4;
          });
      } else {
        var list = scoreList(state.allyChampions(), state.current.strategySelection.enemy.strategy);
        sortBarGroups('ally', list);
        d3.selectAll('.ally-strategy-bar')
          .data(list)
          .transition()
          .duration(speed)
          .attr("width", strategyBarWidth)
          .attr("fill", barColor)
          .attr("x", allyStrategyBarLeft);

        d3.selectAll('.ally-strategy-bar-click')
          .data(list)
          .transition()
          .duration(speed)
          .attr("onclick", function (score) {
            return "renderer.clickStrategy('ally', '" + score[0] + "')";
          });

        d3.selectAll('.ally-strategy-text')
          .data(list)
          .transition()
          .duration(speed)
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

    function selected(kind, position) {
      if (state.current.selectedChampionBox.kind === kind
          && state.current.selectedChampionBox.position.toLowerCase() === position.toLowerCase()) {
        return true;
      }
      return false;
    }

    var normalBorder = "#301740";
    d3.selectAll('.' + kind + '-frame')
      .data(champions)
      .transition()
      .duration(500)
      .attr("stroke", function (champion) {
        if (kind === 'ally' && !championOK(champion.data, kind, champion.kind) && !champion.data.empty) {
          if (selected(kind, champion.kind)) {
            return "#FFBBBB";
          } else {
            return "#FF0000";
          }
        }
        if (selected(kind, champion.kind)) {
          return "#FFFFFF";
        }
        return normalBorder;
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

  function championOK(champion, kind, position) {
    if (state.current.mode.id === "strategy-recommendations" && kind === "ally") {
      if (!((champion[state.current.strategySelection[kind].strategy] >= 4)
            && (positions[champion.role1].toLowerCase() === position.toLowerCase()
                || (positions[champion.role2] || "").toLowerCase() === position.toLowerCase()))) {
        return false;
      }
    }
    if (state.current.mode.id === "lane-counters" && kind === "ally") {
      var champ = state.championAtPosition((kind === "ally") ? "enemy" : "ally", position);
      if ((champ.counters || []).indexOf(champion.name) == -1) {
        return false;
      }
    }
    return true;
  }

  function filteredChampions() {
    var kind = state.current.appState.kind;
    var position = state.current.appState.position;
    function where(champion) {
      if (!championOK(champion, kind, position)) {
        return false;
      }
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

  function prepareSelectionClicks() {
    function removeLast(kind, position) {
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
      var kind = state.current.selectedChampionBox.kind;
      var position = state.current.selectedChampionBox.position;
      if (state.current.appState.id === "select-champion") {
        if (e.which === 8) {
          return removeLast(kind, position) || false;
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
      var kind = state.current.selectedChampionBox.kind;
      var position = state.current.selectedChampionBox.position;
      if (state.current.appState.id === "select-champion") {
        if (e.which === 8) {
          return removeLast(kind, position) || false;
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
      } else if (state.current.appState.id === "normal") {
        // alert(e.which);
        if (e.which === 13) {
          console.log(state.current.selectedChampionBox.kind + ',' + state.current.selectedChampionBox.position);
          window.setTimeout(function () { openSelection(state.current.selectedChampionBox.kind, state.current.selectedChampionBox.position); }, 1);
        } else if (e.which === 39) { // right
          state.current.selectedChampionBox.kind = 'enemy';
          render(state);
        } else if (e.which === 37) { // left
          state.current.selectedChampionBox.kind = 'ally';
          render(state);
        } else if (e.which === 38) { // up

        } else if (e.which === 40) { // down

        }
      }
      return true;
    });
  }

  this.openSelection = function (kind, position) {
    if (state.current.appState.id !== "select-champion") {
      console.log('asdf: ' + kind + ',' + position);
      state.current.selectedChampionBox = { kind: kind, position: position };
      var championName = $('.' + kind + '-name-' + position.toLowerCase()).text();
      state.current.appState = {
        id: "select-champion",
        kind: kind,
        position: position,
        championName: "",//championName,
        champions: []
      };
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

  function renderModeButtons(state) {
    var mode = state.current.mode.id;
    $('#open-button').attr("xlink:href", "images/open-button.png");
    $('#rec-button').attr("xlink:href", "images/rec-button.png");
    $('#counter-button').attr("xlink:href", "images/counter-button.png");
    if (mode === "free-picks") {
      $('#open-button').attr("xlink:href", "images/select-open-button.png");
    } else if (mode === "strategy-recommendations") {
      $('#rec-button').attr("xlink:href", "images/select-rec-button.png");
    } else if (mode === "lane-counters") {
      $('#counter-button').attr("xlink:href", "images/select-counter-button.png");
    }
  }

  function render(state) {
    renderChampionSelection(state);
    renderChampionFrames('ally', state.current.allies);
    renderChampionFrames('enemy', state.current.enemies);
    renderStrategyBars(state);
    renderModeButtons(state);
  }

  this.clickStrategy = function (kind, strategyId) {
    state.selectStrategy(kind, strategyId);
    render(state);
  };

  this.setMode = function (modeName) {
    state.selectMode(modeName);
    render(state);
  };

  window.onload = function () {
    var capture_ypos = /^translate\(\d+,(\d+)\)$/;
    bar_ys['ally'] = $('.ally-strategy-group').get().map(function (node) {
      return parseInt(capture_ypos.exec($(node).attr("transform"))[1]);
    });
    bar_ys['enemy'] = $('.enemy-strategy-group').get().map(function (node) {
      return parseInt(capture_ypos.exec($(node).attr("transform"))[1]);
    });
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
    prepareSelectionClicks();
    render(state);
  };

  return this;
})();
