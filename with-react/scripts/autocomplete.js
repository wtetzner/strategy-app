
var autocomplete = (function () {
  function contains(big, small) {
    return big.indexOf(small) !== -1;
  }

  this.make = function(render) {
    return {
      source: function (request, response) {
        response(
          state.champions
            .filter(function (champion) {
              return !state.isAlly(champion.name) && contains(champion.name.toLowerCase(), request.term.toLowerCase());
            }));
      },
      select: function (event, ui) {
        // alert(ui.item.name);
        var championPosition = 'Top';
        if ($(this).hasClass('top-select')) {
          championPosition = 'Top';
        } else if ($(this).hasClass('jungle-select')) {
          championPosition = 'Jungle';
        } else if ($(this).hasClass('mid-select')) {
          championPosition = 'Mid';
        } else if ($(this).hasClass('carry-select')) {
          championPosition = 'Carry';
        } else if ($(this).hasClass('support-select')) {
          championPosition = 'Support';
        }
        var kind = ($(this).hasClass('ally-select')) ? 'ally' : 'enemy';
        if (kind === 'ally') {
          state.selectAllyChampionByName(state.current, championPosition, ui.item.name);
        } else {
          state.selectEnemyChampionByName(state.current, championPosition, ui.item.name);
        }
        $(this).val(ui.item.name);
        render();
        // window.setTimeout(function () { render(); }, 1);
        return false;
      }
    };
  };
  return this;
})();
