
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
    mode: modes[1],
    allies: [
      { data: null, kind: "Top" },
      { data: null, kind: "Jungle" },
      { data: null, kind: "Mid" },
      { data: null, kind: "Carry" },
      { data: null, kind: "Support" }
    ],
    enemies: [
      { data: null, kind: "Top" },
      { data: null, kind: "Jungle" },
      { data: null, kind: "Mid" },
      { data: null, kind: "Carry" },
      { data: null, kind: "Support" }
    ],
    strategies: {
      "split-push":     { name: "Split Push" },
      "jungle-control": { name: "Jungle Control" },
      "flex-strat":     { name: "Flex Strat" },
      "wombo-combo":    { name: "Wombo Combo" },
      "gank-master":    { name: "Gank Master" },
      "snowball":       { name: "Snowball" }
    },
    allyStrategies:  makeStrategies(this),
    enemyStrategies: makeStrategies(this)
  };

  this.current = empty;

  this.champions = champions;

  function findChampion(name) {
    for (var i = 0; i < this.champions.length; i++) {
      var champion = this.champions[i];
      if (champion.name.toLowerCase() === name.toLowerCase()) {
        return champion;
      }
    }
    return null;
  }

  this.selectAllyChampionByName = function(data, kind, championName) {
    var champion = findChampion(championName);
    for (var i = 0; i < data.allies.length; i++) {
      var ally = data.allies[i];
      if (ally.kind.toLowerCase() === kind.toLowerCase()) {
        ally.data = champion;
        break;
      }
    }
  };

  this.selectEnemyChampionByName = function(data, kind, championName) {
    var champion = findChampion(championName);
    for (var i = 0; i < data.enemies.length; i++) {
      var enemy = data.enemies[i];
      if (enemy.kind.toLowerCase() === kind.toLowerCase()) {
        enemy.data = champion;
        break;
      }
    }
  };

  return this;
})();
