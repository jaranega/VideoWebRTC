            // Muaz Khan     - https://github.com/muaz-khan
	    // MIT License   - https://www.webrtc-experiment.com/licence/
	    // Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCMultiConnection

	    var connection = new RTCMultiConnection();
	    connection.channel = 'maindefaultchannel';
            
	    connection.session = {
	        audio: false,
	        video: false,
	        oneway: true,
	    };
            
            var joinAs = {
                oneway: true // it is not necessary for data-only connection
            };

	    
           var firstLaunch = true;
           connection.onstream = function(e) 
           {
	        console.log(connection.session.id);
	        if (firstLaunch)
	        {
	            e.mediaElement.width = 640;
	            e.mediaElement.height = 360;
	            pistaContainer.insertBefore(e.mediaElement, pistaContainer.firstChild);
                    firstLaunch = false;
                    joinConnectionMarcador();  
	        }
	        else
	        {
	            e.mediaElement.width = 320;
	            e.mediaElement.height = 240;
	            marcadorContainer.insertBefore(e.mediaElement, marcadorContainer.firstChild);
	        }
	       
	        if (e.mediaElement.hasAttribute("controls")) {
	                e.mediaElement.removeAttribute("controls"); 
	        }

	        scaleVideos();
	    };

                   
	   
	    connection.onstreamended = function(e) {
	        e.mediaElement.style.opacity = 0;
	        setTimeout(function() {
	            if (e.mediaElement.parentNode) {
	                e.mediaElement.parentNode.removeChild(e.mediaElement);
	            }
	            scaleVideos();
	        }, 1000);
	    };

	    connection.onNewSession = function(session) {

	        joinConnectionPista();
	        
	    };
            
	    function joinConnectionMarcador()
	    {
	        connection.join('marcador', joinAs);
	    }
	    function joinConnectionPista()
	    {
	        connection.join('pista', joinAs);
	    }

	    var marcadorContainer = document.getElementById('player-score');
	    var pistaContainer = document.getElementById('player-race');
	

	    //OpenSignalingChannel Socket.io over Node.js
	    
	    //var SIGNALING_SERVER = 'http://lolahuge-bcn.com:8020/';
	    var SIGNALING_SERVER = 'http://localhost:8888/';
	    
	    connection.openSignalingChannel = function(config) {   
	       var channel = config.channel || 'maindefaultchannel';
	 
	       
	       io.connect(SIGNALING_SERVER).emit('new-channel', {
	          channel: channel,
	          sender : connection.userid
	       });

	       var socket = io.connect(SIGNALING_SERVER + channel);
	       socket.channel = channel;

	       socket.on('connect', function () {
	          if (config.callback) config.callback(socket);
	       });

	       socket.send = function (message) {
	            socket.emit('message', {
	                sender: connection.userid,
	                data  : message
	            });
	        };

	       socket.on('message', config.onmessage);
	    };
            
	    connection.connect();
            
            window.onunload = window.onbeforeunload = function()
            {
                console.log('onunload');
                connection.leave();
            }
	  
	    function scaleVideos() {
	        var videos = document.querySelectorAll('video'),
	            length = videos.length, video;

	        var minus = 130;
	        var windowHeight = 700;
	        var windowWidth = 600;
	        var windowAspectRatio = windowWidth / windowHeight;
	        var videoAspectRatio = 16 / 9;
	        var blockAspectRatio;
	        var tempVideoWidth = 0;
	        var maxVideoWidth = 0;

	        for (var i = length; i > 0; i--) {
	            blockAspectRatio = i * videoAspectRatio / Math.ceil(length / i);
	            if (blockAspectRatio <= windowAspectRatio) {
	                tempVideoWidth = videoAspectRatio * windowHeight / Math.ceil(length / i);
	            } else {
	                tempVideoWidth = windowWidth / i;
	            }
	            if (tempVideoWidth > maxVideoWidth)
	                maxVideoWidth = tempVideoWidth;
	        }
	        for (var i = 0; i < length; i++) {
	            video = videos[i];
	            if (video)
	                video.width = maxVideoWidth - minus;
	        }
	    }

	    window.onresize = scaleVideos;