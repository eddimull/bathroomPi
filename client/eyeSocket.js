getEyes();
function getEyes() {
    setTimeout(function () {
        if (typeof(io) != "undefined") {
            var socket = io('https://DomainNameOfYourPi.com');
            socket.on('message', function (msg) {

                switch (msg.type) {
                    case 'status':
                        if (parseInt(msg.data) < 100) {
                            $('.eye').css('background', 'red');
                        } else {
                            $('.eye').css('background', 'green');
                        }
                        break;
                    case 'highScore':
                        $('.left.eye').attr('title', 'High Score: ' + msg.data);
                        break;
                    case 'lastScore':
                        $('.right.eye').attr('title', 'Last Score: ' + msg.data);
                        break;
                    default:
                        console.log('wat?');
                }
            });
        } else {
            getEyes();
        }
    }, 250);
}
