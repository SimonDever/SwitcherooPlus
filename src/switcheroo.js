﻿var rules = [];
var rulesUl, newRuleDiv;

function refreshRules() {
	rulesUl.empty();

	if(rules.length){
		$('#no-rules').hide();
		for (var i = 0; i < rules.length; i++) {
			var rule = rules[i];
			var li = $('<li class="' + rule.isActive + '" data-rule-index="' + i + '"/>');
			var fromSpan = '<span class="from" title="' + rule.from + '">' + textMinifier(rule.from) + '</span>';
			var seperator = '<span class="seperator">&rarr;</span>'
			var toSpan = '<span class="to" title="' + rule.to + '">' + textMinifier(rule.to) + '</span>';
			var checked = rule.isActive ? 'checked="checked"' : '';
			var statusActive = rule.isActive ? chrome.i18n.getMessage("enabled") : chrome.i18n.getMessage("disabled");
			var active = '<input type="checkbox" class="active" name="active" ' + checked + '/>';
			active += '<img src="img/' + (rule.isActive ? 'on' : 'off') + '.png" title="' + statusActive + '" alt="' + statusActive + '" class="imgActive imgIcon"/>';
			var textReg = rule.isRegex ? chrome.i18n.getMessage("regularexpression") : chrome.i18n.getMessage("stringreplace");
			var isReg = '<img src="img/regex' + (rule.isRegex ? 'on' : 'off') + '.png" title="' + textReg + '" alt="' + textReg + '" class="imgIcon" />';
			var editLink = '<a href="#" class="editRuleButton"><img src="img/edit.png" title="' + chrome.i18n.getMessage("edit") + '" alt="' + chrome.i18n.getMessage("edit") +'" class="imgIcon" /></a>';
			var removeLink = '<a href="#" class="removeRuleButton"><img src="img/remove.png" title="'+ chrome.i18n.getMessage("remove") +'" alt="'+ chrome.i18n.getMessage("remove") +'" class="imgIcon" /></a>';
			li.append(fromSpan + seperator + toSpan + isReg + active + editLink + removeLink);
			rulesUl.append(li);
		}
	}
	else
	{
		$('#no-rules').show();
	}
}

function textMinifier(text){
	var maxLength = 25;
	if(text && text.length > maxLength){
		text = text.substring(0,maxLength) + "...";
	}

	return text;
}

function addRule() {
	var fromInput, toInput, typeDropDown;

	fromInput = newRuleDiv.children('#fromInput');
	toInput = newRuleDiv.children('#toInput');

	var newRule = {
		from : fromInput.val(),
		to : toInput.val(),
		isActive: true,
		isRegex: false
	};

	chrome.extension.sendMessage({
		rule : newRule
	}, function(response) {
		rules = response.rules;
		refreshRules();
	});

	fromInput.val('');
	toInput.val('');
}

function removeAllRules() {
	if (confirm(chrome.i18n.getMessage("confirmclear"))) {
		chrome.extension.sendMessage({
			removeAllRules : true
		}, function(response) {
			rules = response.rules;
			refreshRules();
		});
	}
}

function toggleRule(index){
	chrome.extension.sendMessage({
		toggleIndex : index
	}, function(response) {
		rules = response.rules;
		refreshRules();
	});
}


function editRule(index, rule) {
	
	chrome.extension.sendMessage({
		editIndex : index,
		updatedRule : rule
	}, function(response) {
		rules = response.rules;
		refreshRules();
	});
}

function removeRule(index) {
	
	chrome.extension.sendMessage({
		removeIndex : index
	}, function(response) {
		rules = response.rules;
		refreshRules();
	});
}

function convertRuleToEditMode(ruleParent, editIndex, rule){
	ruleParent.empty();

	var editRuleDiv = $('<div class="edit-rule" />');

	var fromInput =	$('<input type="text" class="fromInput" name="fromInput" />').val(rule.from);
	var seperator = $('<span class="seperator">&gt;</span>');
	var toInput = $('<input type="text" class="toInput" name="toInput" />').val(rule.to);
	var statusReg = rule.isRegex ? 'checked="checked"' : '';
	
	var isReg = $('<input type="checkbox" class="isreg" name="isreg" ' + statusReg + '/>');
	var isRegText = rule.isRegex ? chrome.i18n.getMessage("regularexpression") : chrome.i18n.getMessage("stringreplace");
	var isRegOnOff = rule.isRegex ? 'on' : 'off';
	var isReg2 = $('<img src="img/regex' + isRegOnOff + '.png" alt="' + isRegText + '" title="' + isRegText + '" class="imgIcon" />');
	
	$(isReg2).click(function() {
		$(isReg).click();
		var regStatus = isReg.prop("checked") ? "on" : "off";
		var regText = isReg.prop("checked") ? chrome.i18n.getMessage("regularexpression") : chrome.i18n.getMessage("stringreplace");
		$(isReg2).attr("src", "img/regex" + regStatus + ".png")
			.attr("title", regText)
			.attr("alt", regText);
	});
	
	var updateRuleButton = $('<input type="image" src="img/save.png" value="Update" name="AddRule" title="' + chrome.i18n.getMessage("save") + '" alt="' + chrome.i18n.getMessage("save") + '" class="imgIcon" />');
	
	editRuleDiv.append(fromInput).append(seperator).append(toInput).append(isReg).append(isReg2).append(updateRuleButton);

	updateRuleButton.click(function(){
		var updatedRule = {
			from : fromInput.val(),
			to : toInput.val(),
			isActive: true,
			isRegex : isReg.prop("checked")
		};

		editRule(editIndex, updatedRule);
	});

	ruleParent.append(editRuleDiv);
}

function getRuleFromListItem(listItem){
	var from = listItem.children('.from').text();
	var to = listItem.children('.to').text();

	return {
		from:from,
		to:to,
	};
}


$(document).ready(function() {
	if (top.location.search.indexOf("options") > 0) {
		$("body").addClass("options");
	}
	
	rulesUl = $('#rules');
	newRuleDiv = $('#new-rule')
	
	chrome.extension.sendMessage({
		getRules : true
	}, function(response) {
		rules = response.rules;
		refreshRules();
	});

	$('#addRuleButton').click(function() {
		addRule();
	});
	
	$('#removeAllRulesButton').click(function() {
		removeAllRules();
	});

	$('#exportAllRulesButton').click(function() {
		exportRules();
	});

	$('#importAllRulesButton').click(function() {
		showImport();
	});

	$('#importButton').click(function() {
		importRules();
	});

	$('#rules').delegate('.active', 'click', function() {
		toggleRule(parseInt($(this).parent().attr('data-rule-index')));
	});
	
	$('#rules').delegate('.imgActive', 'click', function() {
		toggleRule(parseInt($(this).parent().attr('data-rule-index')));
	});
	
	$('#imgIsRegex').click(function() {
		$('#isRegex').click();
		var stateRegex = $('#isRegex').prop("checked") ? 'on' : 'off';
		var textRegex = $('#isRegex').prop("checked") ? chrome.i18n.getMessage("regularexpression") : chrome.i18n.getMessage("stringreplace");
		$('#imgIsRegex').attr("src", "img/regex" + stateRegex + ".png").attr("alt", textRegex).attr("title", textRegex);
	});
	
	$('#rules').delegate('.removeRuleButton', 'click', function() {
		removeRule(parseInt($(this).parent().attr('data-rule-index')));
	});

	$('#rules').delegate('.editRuleButton', 'click', function() {
		var ruleParent = $(this).parent();
		var editIndex = parseInt(ruleParent.attr('data-rule-index'));

		chrome.extension.sendMessage({
			getIndex : editIndex
		}, function(response) {
			convertRuleToEditMode(ruleParent, editIndex, response.rule);
		});
	});
	
	loadWordings();

	$('#fromInput').focus();
});

function exportRules() {
	chrome.extension.sendMessage({
		getRules : true
	}, function(response) {
		rules = response.rules;
		$("#txtExport").text(JSON.stringify(rules, null, 5));
		$("#export").show();
	});
	
}

function showImport() {
	$("#import").show();
}

function importRules() {
	try {
		var newRules = $.parseJSON($("#txtImport").val());;
		chrome.extension.sendMessage({
			importAllRules : true,
			ruleset : newRules
		}, function(response) {
			rules = response.rules;
			refreshRules();
		});
	} catch(e) {
		
	}

}

function loadWordings() {
	/* header */
	$("#productname").text(chrome.i18n.getMessage("appName"));
	$("#cswitcheroo").html(chrome.i18n.getMessage("cswitcheroo"));
	$("#cswitcherooplus").html(chrome.i18n.getMessage("cswitcherooplus"));

	/* placeholder when no rules are present */
	$("#no-rules").text(chrome.i18n.getMessage("norules"));
	
	/* rules list */
	$("#headings .from").text(chrome.i18n.getMessage("from"));
	$("#headings .to").text(chrome.i18n.getMessage("to"));

	/* create new rule */
	$("#newRuleCaption").text(chrome.i18n.getMessage("createnew"));
	$("#addRuleButton").attr("title", chrome.i18n.getMessage("saverule")).attr("alt", chrome.i18n.getMessage("saverule"));
	$("#imgIsRegex").attr("title", chrome.i18n.getMessage("stringreplace")).attr("alt", chrome.i18n.getMessage("stringreplace"));
	$("#captionHelp").text(chrome.i18n.getMessage("helpcaption"));
	$("#captionStringReplace").text(chrome.i18n.getMessage("stringreplace"));
	$("#helpString").text(chrome.i18n.getMessage("helpstring"));
	$("#captionRegex").text(chrome.i18n.getMessage("regularexpression"));
	$("#helpRegex").text(chrome.i18n.getMessage("helpregex"));
	$("#helpSwitch").text(chrome.i18n.getMessage("helpSwitch"));
	
	/* toolbox */
	$("#removeAllRulesButton").val(chrome.i18n.getMessage("removeall"));
	$("#exportAllRulesButton").val(chrome.i18n.getMessage("exportall"));
	$("#importAllRulesButton").val(chrome.i18n.getMessage("importall"));
	$("#toolscaption").text(chrome.i18n.getMessage("toolscaption"));
	$("#toolsOptionsOnly").text(chrome.i18n.getMessage("toolsoptionsonly"));

	/* import / export */
	$("#captionImport").text(chrome.i18n.getMessage("importcaption"));
	$("#captionExport").text(chrome.i18n.getMessage("exportcaption"));
	$("#explainImport").text(chrome.i18n.getMessage("importexplain"));
	$("#explainExport").text(chrome.i18n.getMessage("exportexplain"));
	$("#importButton").val(chrome.i18n.getMessage("importbutton"));
	
}