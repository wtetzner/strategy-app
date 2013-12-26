
var autocomplete = (function () {
  function contains(big, small) {
    return big.indexOf(small) !== -1;
  }

  this.position = function (input) {
    var championPosition;
    // if ($(input).hasClass('top-select')) {
    //   championPosition = 'Top';
    // } else if ($(input).hasClass('jungle-select')) {
    //   championPosition = 'Jungle';
    // } else if ($(input).hasClass('mid-select')) {
    //   championPosition = 'Mid';
    // } else if ($(input).hasClass('carry-select')) {
    //   championPosition = 'Carry';
    // } else if ($(input).hasClass('support-select')) {
    //   championPosition = 'Support';
    // }
    return championPosition;
  };

  this.make = function(kind, render) {
    return {
      minLength: 1,
      source: function (request, response) {
        response(
          state.champions
            .filter(function (champion) {
              var exists = (kind === 'ally') ? state.isAlly(champion.name) : state.isEnemy(champion.name);
              return !exists && contains(champion.name.toLowerCase(), request.term.toLowerCase());
            }));
      },
      select: function (event, ui) {
        var championPosition = position(this);
        var kind = ($(this).hasClass('ally-select')) ? 'ally' : 'enemy';
        if (kind === 'ally') {
          state.selectAllyChampionByName(state.current, championPosition, ui.item.name);
        } else {
          state.selectEnemyChampionByName(state.current, championPosition, ui.item.name);
        }
        render(state);
        $(this).val(ui.item.name);
        return false;
      }
    };
  };
  return this;
})();
