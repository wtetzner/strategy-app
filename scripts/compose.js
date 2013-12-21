var selectedChampions = {},
	selectedStrategy = null,
	applicationState = {
		ChampionFilter: "open",
		Strategy: "",
		AllyStrategy: "",
		EnemyStrategy: ""
	};
	
$(document).ready(function () {
	window.requestAnimFrame = getRequestAnimationFrame();

	preloadImages();
	
	constructChampionSearchBoxes();
	
	constructStrategyButtons();
	
	setChampionFilterButtons();

	test();
});

function setChampionFilterButtons() {
	$(".champion-filter-button").click(
		function() {
			$(".champion-filter-button").each(function() {
				var $button = $(this),
					buttonFilter = $button.attr("filter");

				$button.removeClass(buttonFilter + "-selected").addClass(buttonFilter);
			});

			var $selectedButton = $(this),
				selectedButtonFilter = $selectedButton.attr("filter");

			$selectedButton.removeClass(selectedButtonFilter).addClass(selectedButtonFilter + "-selected");

			applicationState.ChampionFilter = selectedButtonFilter;

			eval(selectedButtonFilter + "ChampionFilter()");
		});
}

function openChampionFilter() {
	$("input.champion-search.search-ally").css({"border": "1px solid black", "background-color": "white"});
}

function recommendedChampionFilter() {
	$("input.champion-search.search-ally").each(function() {
		var $ally = $(this),
			position = $ally.attr("position"),
			allyChampions = champions.filter(function(champion) { return champion.name == $ally.val(); });

		if(
			allyChampions &&
			allyChampions.length == 1 &&
			(
				(allyChampions[0].role1 != "" && roles[allyChampions[0].role1].name.toLowerCase() != position) ||
				(allyChampions[0].role2 != "" && roles[allyChampions[0].role2].name.toLowerCase() != position) ||
				allyChampions[0][applicationState.Strategy] < 4
			)
		) {
			$ally.css({"border": "1px solid red", "background-color": "#f9b7b7"});
		}
		else {
			$ally.css({"border": "1px solid black", "background-color": "white"});
		}
	});
}

function counterChampionFilter() {
	$("input.champion-search.search-enemy").each(function() {
		var $enemy = $(this),
			enemyChampions = champions.filter(function(champion) { return champion.name == $enemy.val(); }),
			$ally = $("input.champion-search.search-ally." + $enemy.attr("position"));
			allyChampions = champions.filter(function(champion) { return champion.name == $ally.val(); });

		if(
			enemyChampions &&
			enemyChampions.length == 1 &&
			allyChampions &&
			allyChampions.length == 1 &&
			$.inArray(allyChampions[0].name, enemyChampions[0].counters) < 0
		) {
			$ally.css({"border": "1px solid red", "background-color": "#f9b7b7"});
		}
		else {
			$ally.css({"border": "1px solid black", "background-color": "white"});
		}
	});
}

function test() {
	var canvas = $("#strategy-canvas").get(0);
	canvas.style.width = "500px";
	canvas.style.height = "500px";

	var context = canvas.getContext("2d");

	var gradient = getGradient(context, { x1: 50, y1: 62.5, x2: 375, y2: 62.5 }, 0, "#ffffff", "#ff0000");
	drawArrow(context, gradient);
	
	animate(0, canvas, context);
}

function animate(gradientStop, canvas, context) {
	gradientStop += 0.01;
	gradientStop = gradientStop > 1 ? 0 : gradientStop;
	
	context.clearRect(0, 0, canvas.width, canvas.height);

	var gradient = getGradient(context, { x1: 50, y1: 62.5, x2: 375, y2: 62.5 }, gradientStop, "#ffffff", "#ff0000");
	drawArrow(context, gradient);
	
	requestAnimFrame(function() {
		animate(gradientStop, canvas, context);
	});
}

function getRequestAnimationFrame() {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) { window.setTimeout(callback, 1000 / 60); };
}

function getGradient(context, boundaries, stop, startColor, stopColor) {
	var gradient = context.createLinearGradient(boundaries.x1, boundaries.y1, boundaries.x2, boundaries.y2);
	
	if(stop > 0) {
		gradient.addColorStop(0, startColor);
	}
	
	gradient.addColorStop(stop, stopColor);
	
	if(stop < 1) {
		gradient.addColorStop(1, startColor);
	}

	return gradient;
}

function drawArrow(context, gradientFill) {
	context.beginPath();
	context.moveTo(50, 50);
	context.lineTo(50, 75);
	context.lineTo(300, 75);
	context.lineTo(300, 90);
	context.lineTo(375, 62.5);
	context.lineTo(300, 35);
	context.lineTo(300, 50);
	context.lineTo(50, 50);
	context.lineWidth = 1;
	context.stroke();
	context.strokeStyle = "#ffffff";
	context.fillStyle = gradientFill;
	context.fill();
	context.closePath();
}

function preloadImages() {
	preloadImages(champions.map(function(champion) { return champion.image; }));
}

function constructChampionSearchBoxes () {
	$(".champion-search").autocomplete({
		source: function(request, response) {
			var championNameExpression = new RegExp(".*" + request.term + ".*", "i"),
				$elementAlly = this.element
				$elementEnemy = $("input.search-enemy." + $elementAlly.attr("position")),
				enemyChampions = champions.filter(function(champion) { return champion.name == $elementEnemy.val(); });

			response(champions
				.filter(function(champion) {
					return (
						championNameExpression.test(champion.name) &&
						!isASelectedChampion(champion.name) &&
						(
							(applicationState.ChampionFilter == "open") ||
							(
								applicationState.ChampionFilter == "recommended" &&
								(
									(
										applicationState.Strategy != "" &&
										champion[applicationState.Strategy] >= 4 &&
										(
											(champion.role1 != "" && roles[champion.role1].name.toLowerCase() == $elementAlly.attr("position")) ||
											(champion.role2 != "" && roles[champion.role2].name.toLowerCase() == $elementAlly.attr("position"))
										)
									) ||
									$elementAlly.hasClass("search-enemy")
								)
							) ||
							(
								applicationState.ChampionFilter == "counter" &&
								(
									(
										enemyChampions &&
										enemyChampions.length == 1 &&
										$.inArray(champion.name, enemyChampions[0].counters) >= 0
									) ||
									$elementAlly.hasClass("search-enemy")
								)
							)
						)
					);
				})
				.map(function(champion) {
					champion.label = champion.name;
					return champion;
				}));;
		},
		minLength: 0,
		select: function(event, ui) {
			var $self = $(this),
				originalChampionName = $self.attr("champion-name"),
				championTeam = $self.hasClass("search-ally") ? "ally" : "enemy";

			if(isASelectedChampion(originalChampionName)) {
				delete selectedChampions[originalChampionName];
			}

			selectedChampions[ui.item.name] = { team: championTeam };

			$self.val(ui.item.name).attr("champion-name", ui.item.name);

			$self.parent().children("img.selected-champion").attr("src", ui.item.image);
			
			var champions = [];
			for(var selectedChampion in selectedChampions) {
				if(selectedChampions[selectedChampion].team == championTeam) {
					champions.push(getChampionByName(selectedChampion));
				}
			}

			var scores = calculateStrategyScores(champions);
			for(var score in scores) {
				var strategyBox = $("div.strategy-" + championTeam + "[strategy='" + score + "']"),
					scoreBox = strategyBox.children("div.strategy-score"),
					boxText = scores[score] * 4;

				boxText = championTeam == "ally" ? boxText + "%&nbsp;" : "&nbsp;" + boxText + "%";
				
				strategyBox.attr("score", scores[score] * 4);
				scoreBox.html(boxText);
			}

			sortElementsByAttribute($("div.strategy-" + championTeam).parent(), "div.strategy-box", "score");

			/*			
			championSelected(
				event,
				$self,
				$self.attr("championname"),
				$self.attr("src"),
				$self.attr("championposition"),
				$self.attr("championstrategy"),
				{
					top: $self.attr("championlocationtop"),
					left: $self.attr("championlocationleft")
				});
			*/

			return false;
		}
	}).focus(function () {
		$(this).autocomplete("search");
	});

	$(".champion-search").each(function() {
		$(this).data( "ui-autocomplete" )._renderItem = function(ul, item) {
			return $("<li>")
				.append(" \
					<a> \
						<table> \
							<tr> \
								<td> \
									<img style='height: 30px' src='" + item.image + "' /> \
								</td> \
								<td> \
									" + item.name + " \
								</td> \
							</tr> \
						</table> \
					</a>")
				.appendTo(ul);
		};
    });
}

function sortElementsByAttribute(parent, childSelector, keyAttribute) {
	var items = parent.children(childSelector).sort(function(a, b) {
		var vA = parseInt($(a).attr(keyAttribute));
		var vB = parseInt($(b).attr(keyAttribute));
		
		return (vA > vB) ? -1 : (vA < vB) ? 1 : 0;
	});
	
	parent.append(items);
};

function constructStrategyButtons() {
	$(".strategy-box").click(function() {
		var $self = $(this);
		$(".strategy-box").parents("td.strategies").find(".strategy-box").css("border", "2px solid white");
		$self.css("border", "2px solid black");

		selectedChampions = {};

		var strategy = $self.attr("strategy");
		applicationState.Strategy = strategy;
		selectedStrategy = strategy;

		if($self.hasClass("strategy-ally")) {
			var selectedStrategy = strategies[strategy];

			var invertedStrategy = [];
			for(var key in selectedStrategy) {
				invertedStrategy.push({ Strategy: key, Value: selectedStrategy[key] });
			}
			
			invertedStrategy.sort(function(a, b) {
				var comparison = 0;
				if (a.Value < b.Value) {
					comparison = -1;
				}
				else if (a.Value > b.Value) {
					comparison = 1;
				}
				return comparison;
			});
			
			var lastStrategyValue = 0,
				lastStrategyWidth = 250;
			for(var strategyIndex = 0; strategyIndex < invertedStrategy.length; strategyIndex++) {
				if(strategyIndex == 0) {
					lastStrategyValue = invertedStrategy[0].Value;
					invertedStrategy[0].Width = lastStrategyWidth;
				}
				else {
					if(invertedStrategy[strategyIndex].Value == lastStrategyValue) {
						invertedStrategy[strategyIndex].Width = lastStrategyWidth;
					}
					else {
						lastStrategyValue = invertedStrategy[strategyIndex].Value;
						lastStrategyWidth -= 26;
						invertedStrategy[strategyIndex].Width = lastStrategyWidth;
					}
				}
			}

			$(".strategy-enemy").each(function() {
				var $enemyStrategy = $(this);
				var matchingStrategy = invertedStrategy.filter(function(strategy) {
					return strategy.Strategy == $enemyStrategy.attr("strategy");
				})[0];
				
				//$enemyStrategy.css("width", matchingStrategy.Width + "px");
				$enemyStrategy.animate({ width: matchingStrategy.Width + "px" }, 500);
			});
		}

		var topChampions = getAbove(champions, roles, "top", strategy, 2);
		var jungleChampions = getAbove(champions, roles, "jungle", strategy, 2);
		var midChampions = getAbove(champions, roles, "mid", strategy, 2);
		var supportChampions = getAbove(champions, roles, "support", strategy, 2);
		var carryChampions = getAbove(champions, roles, "carry", strategy, 2);
		
		var $selection = $("<table></table>");
		$selection.append(getChampionRow(topChampions, "top", strategy, { top: roles.A.top, left: roles.A.left }));
		$selection.append(getChampionRow(jungleChampions, "jungle", strategy, { top: roles.B.top, left: roles.B.left }));
		$selection.append(getChampionRow(midChampions, "mid", strategy, { top: roles.C.top, left: roles.C.left }));
		$selection.append(getChampionRow(supportChampions, "support", strategy, { top: roles.D.top, left: roles.D.left }));
		$selection.append(getChampionRow(carryChampions, "carry", strategy, { top: roles.E.top, left: roles.E.left }));

		var $selectionParent = $(".selection");
		$selectionParent.effect("drop", {}, 300, function() {
			$("div.map > img").remove();
			$("div.composition-information").html("Champion Synergy<br />0%");

			$selectionParent.empty().append($selection).effect("slide", {}, 300, null);
		});
	});
}

function calculateTotalChampionScore(champion) {
	return champion.oo + champion.os + champion.ss + champion.sh + champion.ho + champion.hh;
}

function calculateStrategyScores(champions) {
	var scores = { oo: 0, os: 0, ss: 0, sh: 0, ho: 0, hh: 0 },
		empty = { oo: 0, os: 0, ss: 0, sh: 0, ho: 0, hh: 0 };

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

function getTopN(champions, roles, position, strategy, n) {
	return champions
		.filter(function(champion) {
			var regex = eval("/^" + position + "$/i");
			return regex.test(roles[champion.role1].name) || regex.test(roles[champion.role2].name);
		})
		.sort(function(a, b) { return b[strategy] - a[strategy]; })
		.slice(0, n);
}

function getAbove(champions, roles, position, strategy, n) {
	return champions
		.filter(function(champion) {
			var regex = eval("/^" + position + "$/i");
			var isValid =
				(
					(
						roles[champion.role1] &&
						regex.test(roles[champion.role1].name)
					) ||
					(
						roles[champion.role2] &&
						regex.test(roles[champion.role2].name)
					)
				) &&
				champion[strategy] > n;

			return isValid;
		})
		.sort(function(a, b) { return b[strategy] - a[strategy]; });
}

function isASelectedChampion(championName) {
	var isASelectedChampion = false;
	
	if(selectedChampions && championName) {
		for(var selectedChampion in selectedChampions) {
			if(selectedChampion == championName) {
				isASelectedChampion = true;
				break;
			}
		}
	}
	
	return isASelectedChampion;
}

function getChampionByName(championName) {
	var champion = null;
	
	if(champions) {
		var championNameExpression = eval('/^' + championName + '$/i');
		
		champion = champions.filter(function(currentChampion) {
			return championNameExpression.test(currentChampion.name);
		});
		
		if(champion && champion.length > 0) {
			champion = champion[0];
		}
	}
	
	return champion;
}

function getChampionRow(champions, position, strategy, location) {
	var $row = $(" \
		<tr class='champion-row'> \
			<td class='all-champions'> \
				<div style='-webkit-user-select: none; -webkit-user-drag: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); width: 350px; border: 1px solid #999999' class='carousel'> \
					<ul class='animate'> \
					</ul> \
				</div> \
			</td> \
			<td class='position'> \
			</td> \
			<td class='selected-champion'> \
			</td> \
		</tr> \
	");

	var $carousel = $row.find("div.carousel"),
		$list = $carousel.find(".animate"),
		$listItem = $("<li></li>"),
		$position = $row.find(".position");
		
	$carousel.css("background-color", $("div.strategy-box[strategy=" + strategy + "]").css("background-color"));
	
	$position.text(position);

	for(var championIndex = 0; championIndex < champions.length; championIndex++) {
		var champion = champions[championIndex],
			$image = getChampionImage(champion.name, champion.image, position, strategy, location);
			
		$listItem.append($image);
			
		if(championIndex % 5 == 4) {
			$list.append($listItem);
			
			$listItem = championIndex < champions.length - 1 ? $("<li></li>") : null;
		}
	}
	
	if($listItem != null) {
		$list.append($listItem);
	}
	
	var carousel = new Carousel($carousel);
	carousel.init();
	
	carousel.first();
	
	return $row;
}

function getChampionImage(championName, championImage, position, strategy, location) {
	var positionExpression = eval("/^" + position + "$/i"),
		role = null;

	for(role in roles) {
		role = roles[role];
		
		if(positionExpression.test(role.name)) {
			break;
		}
	}
	
	return $("<img />")
		.addClass("champion-icon")
		.attr("src", championImage)
		.attr("title", championName)
		.attr("championname", championName)
		.attr("championposition", position)
		.attr("championstrategy", strategy)
		.attr("championlocationtop", location.top)
		.attr("championlocationleft", location.left)
		.tooltip({
			track: true,
			delay: 0,
			fade: 250,
			showURL: false,
			bodyHandler: function() {
				return "<div><b>" + championName + "</b><br />" + role[strategy] + "</div>";
			}
		})
		.on('dragstart', function(event) {
			event.preventDefault();
		})
		.on('dblclick', function(event) {
			var $self = $(this);
			
			championSelected(
				event,
				$self,
				$self.attr("championname"),
				$self.attr("src"),
				$self.attr("championposition"),
				$self.attr("championstrategy"),
				{
					top: $self.attr("championlocationtop"),
					left: $self.attr("championlocationleft")
				});
		});
}

function championSelected(event, $self, championName, championImage, position, strategy, location) {
	var $row = $self.parents("tr.champion-row"),
		$positionCell = $row.find("td.position"),
		$selectedChampionCell = $row.find("td.selected-champion"),
		$selectedChampionImage = getChampionImage(championName, championImage, position, strategy, location)
			.unbind('dblclick')
			.on('dblclick', function(event) {
				var $self = $(this);
			
				$selectedChampionCell.empty();
	
				$positionCell.css("text-align", "left");
				
				removeFromMap(championName);
	
				unselectChampion(
					$self.attr("championname"),
					$self.attr("src"),
					$self.attr("championposition"),
					$self.attr("championstrategy"),
					{
						top: $self.attr("championlocationtop"),
						left: $self.attr("championlocationleft")
					});
			});

	var previousChampion = $selectedChampionCell.find("img.champion-icon").attr("championname");
	
	$selectedChampionCell.empty().append($selectedChampionImage);
	
	$positionCell.css("text-align", "right");
	
	removeFromMap(previousChampion);
	placeOnMap(championName, championImage, position, strategy, location);

	selectChampion(previousChampion, championName, championImage, position, strategy, location);
}

function placeOnMap(championName, championImage, position, strategy, location) {
	var $map = $("div.map"),
		$image = getChampionImage(championName, championImage, position, strategy, location)
			.unbind('dblclick')
			.css({
				"width": "30px",
				"position": "absolute",
				"top": location.top + "%",
				"left": location.left + "%"
			});

	$map.append($image);
}

function removeFromMap(championName) {
	$("div.map").find("img[championname='" + championName + "']").remove();
}

function selectChampion(oldChampionName, newChampionName, newChampionImage, position, strategy, location) {
	if(selectedChampions) {
		if(selectedChampions[oldChampionName]) {
			delete selectedChampions[oldChampionName];
		}
		
		if(selectedChampions[newChampionName]) {
			delete selectedChampions[newChampionName];
		}
	}
	
	selectedChampions[newChampionName] = {};
	
	$("img.champion-icon-disabled")
		.removeClass("champion-icon-disabled")
		.on('dblclick', function(event) {
			var $self = $(this);

			championSelected(
				event,
				$self,
				$self.attr("championname"),
				$self.attr("src"),
				$self.attr("championposition"),
				$self.attr("championstrategy"),
				{
					top: $self.attr("championlocationtop"),
					left: $self.attr("championlocationleft")
				});
		});

	for(var champion in selectedChampions) {
		$("li > img.champion-icon[championname='" + champion + "']")
			.addClass("champion-icon-disabled")
			.unbind("dblclick");
	}

	setCompositionInformation();
}

function unselectChampion(selectedChampion, championImage, position, strategy, location) {
	if(selectedChampions && selectedChampions[selectedChampion]) {
		delete selectedChampions[selectedChampion];
	}
	
	$("img.champion-icon-disabled[championname='" + selectedChampion + "']")
		.removeClass("champion-icon-disabled")
		.on('dblclick', function(event) {
			var $self = $(this);

			championSelected(
				event,
				$self,
				$self.attr("championname"),
				$self.attr("src"),
				$self.attr("championposition"),
				$self.attr("championstrategy"),
				{
					top: $self.attr("championlocationtop"),
					left: $self.attr("championlocationleft")
				});
		});

	setCompositionInformation();
}

function setCompositionInformation() {
	var strategyTotal = 0;
	
	if(selectedChampions && selectedStrategy) {
		for(var champion in selectedChampions) {
			strategyTotal += champions.filter(function(currentChampion) {
				return currentChampion.name == champion;
			})[0][selectedStrategy];
		}
	}
	
	$("div.composition-information").html("Champion Synergy<br />" + (strategyTotal * 4) + "%");
}

function preloadImages(images) {
	$(images).each(function(){
		$('<img />')[0].src = this;
	});
}