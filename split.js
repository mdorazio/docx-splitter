(function() {
    document.getElementById("document")
        .addEventListener("change", handleFileSelect, false);
    
	var options = {
		styleMap: [
			"u => u"
		] //have to manually map underlines since by default mammoth ignores them
	};
	
    function handleFileSelect(event) {
        readFileInputEventAsArrayBuffer(event, function(arrayBuffer) {
            mammoth.convertToHtml({arrayBuffer: arrayBuffer}, options)
                .then(displayResult)
                .done();
        });
    }
    
    function displayResult(result) {
		console.log(result.value);
		var lined = result.value.replace(/(<\/.*?)(?=<[a-zA-Z])/g,"$1\n");  //breaks lines for parsing and splitting
		var lines = lined.split("\n");
		console.log(lines);
		var linePrefixes = [];
		var regex = /.*>(?=[a-zA-Z0-9])/;
		var numLines = lines.length;
		for (var i = 0; i < numLines; i++)
		{
			if(lines[i].substring(0,7) == "<p><img")
			{
				linePrefixes.push("<img>"); //the base64 string screws up regex, so we have to ignore it
			}
			else
			{
				var match = regex.exec(lines[i]);
				if(match) 
				{
					linePrefixes.push(match[0]);
				}
				else
				{
					linePrefixes.push("");
				}
			}
		}
		console.log(linePrefixes);
		
		//now we need to parse the lines to determine where sections should break.
		var matches = [];
		for (var i = 0; i < numLines; i++)
		{
			matches.push(i);
			//loop through the rest of the nodes to look for a match.  start at +2 to ignore blank sections
			for (var currIndex = i+2; currIndex < numLines; currIndex++)
			{
				//look for string matches, ignoring basic paragraphs and images
				if(linePrefixes[i] != "<p>" && linePrefixes[i] != "<img>" && linePrefixes[i] == linePrefixes[currIndex])
				{
					matches.push(currIndex);
				}
			}
			if(matches.length > 1)
			{
				break; //found at least one section match, so break the loop
			}
			else
			{
				matches = []; //otherwise reset the matches array to null
			}
		}
		console.log(matches);
		
		if(matches.length == 0)
		{
			//no matches found for sections, so assume one giant text blob.  just send the whole thing to an editor block
			document.getElementById("output").innerHTML = result.value;
			$("#output").htmlarea();
		}
		else
		{
			for (var n = 0; n < matches.length; n++)
			{
				if (n == 0 && matches[n] == 0)
				{
					//it's the first one, and it's also the first line of the document
					var concatStr = "";
					for (var x = matches[n]; x < matches[n+1]; x++)
					{
						concatStr += lines[x];
					}
					$("#output").text(concatStr);
				}
				else if(n == 0 && matches[n] > 0)
				{
					//it's the first one, and it's after the document's first line, so we have to first get the content before it
					var concatStr = "";
					for (var x = 0; x < matches[n]; x++)
					{
						concatStr += lines[x];
					}
					$("#output").text(concatStr);
					
					//then add the content from this one to the next match
					concatStr = "";
					for (var x = matches[n]; x < matches[n+1]; x++)
					{
						concatStr += lines[x];
					}
					$("#editors").append("<textarea id='output" + n + "' class='editor' cols='114' rows='30'>" + concatStr + "</textarea>");
				}
				else if(n > 0 && n < matches.length - 1)
				{
					//it's not the first one, but there's at least one more
					var concatStr = "";
					for (var x = matches[n]; x < matches[n+1]; x++)
					{
						concatStr += lines[x];
					}
					$("#editors").append("<textarea id='output" + n + "' class='editor' cols='114' rows='30'>" + concatStr + "</textarea>");
				}
				else if(n > 0 && n == matches.length - 1)
				{
					//it's the last one
					var concatStr = "";
					for (var x = matches[n]; x < numLines; x++)
					{
						concatStr += lines[x];
					}
					$("#editors").append("<textarea id='output" + n + "' class='editor' cols='114' rows='30'>" + concatStr + "</textarea>");
				}
			}
			$(".editor").htmlarea();
			
		}
		
		//$("#output").htmlarea();
        
        var messageHtml = result.messages.map(function(message) {
            return '<li class="' + message.type + '">' + escapeHtml(message.message) + "</li>";
        }).join("");
        
        document.getElementById("messages").innerHTML = "<ul>" + messageHtml + "</ul>";
    }
    
    function readFileInputEventAsArrayBuffer(event, callback) {
        var file = event.target.files[0];

        var reader = new FileReader();
        
        reader.onload = function(loadEvent) {
            var arrayBuffer = loadEvent.target.result;
            callback(arrayBuffer);
        };
        
        reader.readAsArrayBuffer(file);
    }

    function escapeHtml(value) {
        return value
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }
})();
