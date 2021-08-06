var modalAriaDescId = 'mss-modal-desc-id';
let currentModalClass = 'current-mss-modal';
var currentDialogContentId = 'current-mss-modal-content';
var currentDialogId = 'currentDialog';
var modalTriggerClass = '.modal-trigger';
var focusIdAfterDialogClose = '';
var modalClickElements = new Map();

/**
 * This function is used to register all modal click events
 * by storing their click handlers with associated ids and unbinds them.
 * Then rebinds the click handler with correct id to set the focus back upon modal closure.
 * @returns
 */
function registerModalTriggers(){
	//unbind all the onclick events and store them in modalClickElements map.
	$j(modalTriggerClass).each(function(i, f) {
		//Unbind only if the element has id and onclick event.
		if(f.id && f.onclick){
			modalClickElements.set(f.id, f.onclick); 
			$j(this).prop("onclick", null).off("click");
		}
	});
	
	//bind the modified one from the modalClickElements map.
	$j(modalTriggerClass).each(function(i, f) {
	    $j(this).on("click", function(){
	    	if(modalClickElements.has(f.id)){
	    		focusIdAfterDialogClose = f.id;
	    		modalClickElements.get(f.id).call(this);
	    	}
	    });
	});
}

$j(document).ready(function(){
	registerModalTriggers();
});

var Ept = function() {
	
	function createButtonCluster(buttons) {
		const buttonsDiv = document.createElement("div");
		buttonsDiv.className  = 'calpers-buttons';
		buttons.forEach(function(button, index) {
			 let buttonId = currentDialogContentId+"button"+index;
			 const buttonElement = document.createElement("button");
			 buttonElement.type = "button";
			 buttonElement.className  = button.class;
			 if(button.id){
				 buttonElement.id = button.id
			 }else{
				 buttonElement.id = buttonId
			 }
			 button.id = buttonElement.id;
			 buttonElement.innerHTML = button.text;
			 buttonsDiv.appendChild(buttonElement);
		})
		return buttonsDiv;
	}
	
	// Private	
	function createAndShowDialog(heading, body, buttonObject) {	
		//$j('.'+currentModalClass).remove();
		//$j('#'+currentDialogContentId).remove();			
		$j('h1').after('<div class="js-modal '+ currentModalClass+'" data-modal-prefix-class="mycal" data-modal-content-id = "'+currentDialogContentId+'" data-focus-back = "'+ focusIdAfterDialogClose +'" data-modal-title = "'+ heading + '" data-modal-describedby-id="'+modalAriaDescId+'" ></div>');
		const buttonsDiv = createButtonCluster(buttonObject);
		$j('h1').after('<div class="mycal-sr-only" id="'+currentDialogContentId+'"></div>');
		$j('#'+currentDialogContentId).append(body);
		//Wrap aria-describedby id around the modal body, before adding the buttons. Add this ONLY if mss-modal-desc-id is not present in body
		if(body.indexOf(modalAriaDescId) == -1){
			$j('#'+currentDialogContentId).html('<span id="'+modalAriaDescId+'">'+$j('#'+currentDialogContentId).html()+'</span>');
		}
		$j('#'+currentDialogContentId).append(buttonsDiv);
		$j('.'+currentModalClass).trigger('click');
		buttonObject.forEach(function(button, index) {
			 let buttonId = button.id;			 
			 if(button.click){
				 document.getElementById(buttonId).addEventListener('click', button.click);
				 document.getElementById(buttonId).addEventListener('keydown', function (e) {
					    if (e.keyCode === 13) {
					    	button.click();
					    }
					});
			 }
		})		
	}

	// Private	
	function createProgressModal(heading) {		
		$j('#'+focusIdAfterDialogClose).attr('disabled', true);
		$j('h1').after('<div class="js-modal '+ currentModalClass+'" data-modal-prefix-class="mycal" data-modal-content-id = "'+currentDialogContentId+'" data-focus-back = "'+ focusIdAfterDialogClose +'" data-modal-title = "'+ heading + '" data-modal-describedby-id="'+modalAriaDescId+'" ></div>');
		$j('h1').after('<div class="mycal-sr-only" id="'+currentDialogContentId+'"></div>');
		$j('#'+currentDialogContentId).append('<p>Your request is being processed</p><progress id="modalProgressBar"></progress>');

		$j('#'+currentDialogContentId).html('<div id="currentDialog">'+$j('#'+currentDialogContentId).html()+'</div>');
		//Trigger modal pop-up after a second
		setTimeout(function() { $j('.'+currentModalClass).trigger('click'); }, 500);
		
	}
		
	// Public
	return {
		
		createDialog : function(div, options) {		
			var divId = '';
			if (typeof options.buttons !== 'undefined' && options.buttons.length > 0) {
			}else{
				options.buttons = [];
			}
			
			// add generic close link
			if (options.closeButton === null || options.closeButton != false && (options.noCloseButton === null || options.noCloseButton != true)) {
				options.buttons.push({
				      text: "Close",
				      class : 'mycal-button-secondary button js-modal-close'
				});
			}
			
			// setup $div placeholder if needed, else use 
			// div selector parameter to find div on page 
			var $div = null;
			if ( div == null || $j(div).length < 1) {
				$j('body').append('<div id='+currentDialogId+'></div>');
				$div = $j('#'+currentDialogId);			
				options.save = '';
			} 
			else
			{
			    $div = $j(div);
				options.save = divId = div.replace('#','');	
			}
			if(options.body){
				$div.html(options.body);
			}
			
			var modalDivWrapper = '<div class="js-modal '+ currentModalClass+'" data-modal-prefix-class="mycal" data-modal-content-id = "'+currentDialogContentId+'" data-focus-back = "'+ focusIdAfterDialogClose +'" data-modal-title = "'+ options.title + '"';
			//Wrap aria-describedby id around the modal body, before adding the buttons. Add this ONLY if mss-modal-desc-id is not present in body
			if($div.html().indexOf(modalAriaDescId) !== -1){
				modalDivWrapper +=  'data-modal-describedby-id="'+modalAriaDescId+'"';
			}
			$j('body').prepend(modalDivWrapper + '></div>');
			

			const buttonsDiv = createButtonCluster(options.buttons);		
			var modalForm = $div.find("form");
			if(modalForm && modalForm.length > 0){
				modalForm.append(buttonsDiv);
			}else{
				$div.append(buttonsDiv);
			}
			$div.wrap('<div class="mycal-sr-only" id="'+currentDialogContentId+'"></div>');		
			$j('.'+currentModalClass).trigger('click');
			//Register any create event
			if(options.create){
				options.create();
			}
			options.buttons.forEach(function(button, index) {
				 let buttonId = button.id;			 
				 if(button.click){
					 document.getElementById(buttonId).addEventListener('click', button.click);
					 document.getElementById(buttonId).addEventListener('keydown', function (e) {
						    if (e.keyCode === 13) {
						    	button.click();
						    }
						});
				 }
			})
			
			//Finally register close event (if exists)
			if(options.close){
				//document.getElementById(buttonId).addEventListener('click', options.close);
			}
			
		},
		
		progressModal : function() {
			createProgressModal("Processing");
		},

		createSimpleDialog : function(options) {
			this.createDialog(null, options);			
		},
		
		showAlert : function(body, heading) {
			buttonObject =[
			    	{
				      text: "OK",
				      class : 'button mycal-button js-modal-close'
				    }
				  ]; 
			createAndShowDialog(heading,body,buttonObject);
		},
		
		confirmLink : function(link, body, heading) {
			if ( heading == null ) {
				heading = "Confirmation";
			}
			if ( body == null ) {
				body = "Are you sure wish to navigate to: " + link;				
			}
			buttonObject =[
		    	{
			      text: "OK",
			      click: function() {
			    	  window.location = link;
			      },
			      class : 'button mycal-button'
			    },
		    	{
			      text: "Cancel",
			      class : 'mycal-button-secondary button js-modal-close'
				 }
			  ]; 
			
			createAndShowDialog(heading,body,buttonObject);
		},
		
		/*
		 * Creates a modal dialog to Prompts the user to confirm that 
		 * they intend to transfer to the link
		 * parameters:
		 *  link - link to navigate to
		 *  body - html format of message to user
		 *  heading - text of dialog heading
		 *  options - contains the button options if you want to customize
		 *            the button labels.  In the form of:
		 *            {'submitName':'I\'m sure', 'cancelName':'Cancel'} 
		 */
		confirmLinkWithOptions : function(link, body, heading, options) {
			var options = $j.extend( {
	    		submitName	: 'OK',
	    		cancelName : 'Cancel'	    			
	    	}, options);
			
			if ( heading == null ) {
				heading = "Confirmation";
			}
			if ( body == null ) {
				body = "Are you sure wish to navigate to: " + link;				
			}
			buttonObject =[
		    	{
			      text: options.submitName,
			      click: function() {
			    	  window.location = link;
			      },
			      class : 'button mycal-button'
			    },
		    	{
			      text: options.cancelName,
			      class : 'mycal-button-secondary button js-modal-close'
				 }
			  ]; 
			
			createAndShowDialog(heading,body,buttonObject);
		},
		
		confirmSubmit : function(body, heading, form, pageActionExecute, options) {
	    	var options = $j.extend( {
	    		submitName	: 'OK',
	    		cancelName : 'Cancel'	    			
	    	}, options);
			
			var f;
			var _forms = $$('form.submitForm');
			if( form == null) {
				f = (_forms.length > 0) ? _forms[0] : document.forms[0];		
			}			
			else {
				f = document.forms[form];
			}
			
			if ( heading == null ) {
				heading = "Confirmation";
			}
			
			if ( body == null ) {
				body = "Are you sure you want to continue?";
			}

			buttonObject =[
		    	{
			      text: options.submitName,
			      click: function() {
						if ( pageActionExecute != null ) {				
							hiddenFieldRegistry.removeAllFromDom();
							
							if(pageActionExecute != null && pageActionExecute != "" && f != null)
							{
								appendHiddenField(f, pageActionExecute, "execute", false);
							}
						}
					
						f.submit();
			      },
			      class : 'button mycal-button'
			    },
		    	{
			      text: options.cancelName,
			      class : 'mycal-button-secondary button js-modal-close'
				 }
			  ]; 
			
			createAndShowDialog(heading,body,buttonObject);
			return false;
		},
		
	};
	
}();