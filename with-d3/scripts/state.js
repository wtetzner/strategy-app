
var state = (function () {
  function makeStrategies(data) {
    var result = [];
    for (id in data.strategies) {
      var strat = data.strategies[id];
      result.push({ id: id, name: strat.name, chance: 0, strength: 0 });
    }
    return result;
  }

  this.modes = [
    { id: "free-picks", name: "Free Picks" },
    { id: "strategy-recommendations", name: "Strategy Recommendations" },
    { id: "lane-counters", name: "Lane Counters" }
  ];

  this.empty = {
    mode: modes[0],
    allies: [
      { data: { empty: true, name: "", image: "images/unknown.png" }, kind: "Top" },
      { data: { empty: true, name: "", image: "images/unknown.png" }, kind: "Jungle" },
      { data: { empty: true, name: "", image: "images/unknown.png" }, kind: "Mid" },
      { data: { empty: true, name: "", image: "images/unknown.png" }, kind: "Carry" },
      { data: { empty: true, name: "", image: "images/unknown.png" }, kind: "Support" }
    ],
    enemies: [
      { data: { empty: true, name: "", image: "images/unknown.png" }, kind: "Top" },
      { data: { empty: true, name: "", image: "images/unknown.png" }, kind: "Jungle" },
      { data: { empty: true, name: "", image: "images/unknown.png" }, kind: "Mid" },
      { data: { empty: true, name: "", image: "images/unknown.png" }, kind: "Carry" },
      { data: { empty: true, name: "", image: "images/unknown.png" }, kind: "Support" }
    ],
    strategies: {
      "split-push":     { name: "Split Push" },
      "jungle-control": { name: "Jungle Control" },
      "flex-strat":     { name: "Flex Strat" },
      "wombo-combo":    { name: "Wombo Combo" },
      "gank-master":    { name: "Gank Master" },
      "snowball":       { name: "Snowball" }
    },
    strategySelection: { ally: { strategy: null }, enemy: { strategy: null } },
    allyStrategies:  makeStrategies(this),
    enemyStrategies: makeStrategies(this),
    appState: { id: "normal" }
  };

  this.current = empty;

  this.strategies = strategies;
  this.champions = champions;
  this.championNameMaxSize = champions.map(function (champion) { return champion.name.length; })
    .reduce(function (previous, current) {
      return Math.max(previous, current);
    });

  function findChampion(name) {
    if (name === "") return null;
    for (var i = 0; i < this.champions.length; i++) {
      var champion = this.champions[i];
      if (champion.name.toLowerCase() === name.toLowerCase()) {
        return champion;
      }
    }
    return null;
  }

  this.isAlly = function (championName) {
    var name = championName.toLowerCase();
    for (var i = 0; i < this.current.allies.length; i++) {
      var ally = this.current.allies[i];
      if (!ally.data.empty && ally.data.name.toLowerCase() === name) {
        return true;
      }
    }
    return false;
  };

  this.isEnemy = function (championName) {
    var name = championName.toLowerCase();
    for (var i = 0; i < this.current.enemies.length; i++) {
      var enemy = this.current.enemies[i];
      if (!enemy.data.empty && enemy.data.name.toLowerCase() === name) {
        return true;
      }
    }
    return false;
  };

  this.selectAllyChampionByName = function(data, kind, championName) {
    var champion = findChampion(championName);
    for (var i = 0; i < data.allies.length; i++) {
      var ally = data.allies[i];
      if (ally.kind.toLowerCase() === kind.toLowerCase() && champion) {
        ally.data = champion;
        break;
      }
    }
    data.appState = { id: "normal" };
  };

  this.selectEnemyChampionByName = function(data, kind, championName) {
    var champion = findChampion(championName);
    for (var i = 0; i < data.enemies.length; i++) {
      var enemy = data.enemies[i];
      if (enemy.kind.toLowerCase() === kind.toLowerCase() && champion) {
        enemy.data = champion;
        break;
      }
    }
    data.appState = { id: "normal" };
  };

  this.setChampionName = function(kind, position, championName) {
    if (state.current.appState.id === "select-champion") {
      state.current.appState.championName = championName;
    }
  };

  function filterChampions(champions) {
    return champions
      .filter(function (champion) { return !champion.data.empty; })
      .map(function (champion) { return champion.data; });
  }

  this.allyChampions = function() {
    return filterChampions(this.current.allies);
  };

  this.enemyChampions = function() {
    return filterChampions(this.current.enemies);
  };

  this.selectStrategy = function(kind, strategyId) {
    this.current.strategySelection[kind] = { strategy: strategyId };
  };

  this.selectMode = function (modeName) {
    for (var i = 0; i < modes.length; i++) {
      if (modes[i].id === modeName) {
        this.current.mode = modes[i];
      }
    }
  };

  return this;
})();
