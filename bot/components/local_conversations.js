// this module is used to create local conversations with your bot
module.exports = function localConversations (controller) {
  // simple example of single answer script
  // controller.hears('test', 'direct_message,live_chat,channel,private_channel', function (bot, message) {
  //     console.log(message)
  //     bot.send(message, 'I heard a test message');
  // });
  const io = require('socket.io-client')('127.0.0.1')
  require('yoctolib-es2017/yocto_api.js');
  require('yoctolib-es2017/yocto_lightsensor.js');
  controller.hears(['help'],'direct_message,live_chat,channel,private_channel',function (bot,message)
  {
    bot.startConversation(message,function(err,convo){
      convo.say('To start watching the light tell me `watch`');
    })
  })
  
  controller.hears(['watch','remind me','alert me'], 'direct_message,live_chat,channel,private_channel', function (bot, message) {
    bot.startConversation(message, function (err, convo) {
      convo.say('Alright, Watching.')
      
      
      watchLights().then(lights=>{


        convo.say(lights);
      
      })
    

    async function watchLights ()   {
        await YAPI.LogUnhandledPromiseRejections()
        await YAPI.DisableExceptions()
        // Setup the API to use the VirtualHub on local machine
        let errmsg = new YErrorMsg()
        if (await YAPI.RegisterHub(process.env.LIGHTHOST, errmsg) != YAPI.SUCCESS) {
          console.log('Cannot contact VirtualHub on 127.0.0.1: ' + errmsg.msg)
            return 'Cannot connect to device';
        }
    
        // Select specified device, or use first available one
        let serial = process.argv[process.argv.length - 1]
        if (serial[8] != '-') {
          // by default use any connected module suitable for the demo
          let anysensor = YLightSensor.FirstLightSensor()
            if (anysensor) {
            let module = await anysensor.module()
                serial = await module.get_serialNumber()
            } else {
            console.log('No matching sensor connected, check cable !')
                return
          }
        }
        
        console.log('Using device ' + serial)
        light = YLightSensor.FindLightSensor(serial + '.lightSensor')
    
        var lightVal = await refresh();
        return lightVal;
    }

    async function refresh()
    {
        if (await light.isOnline()) {
            var lightVal = await light.get_currentValue();
            
            if (lightVal > 100) {
                  setTimeout(refresh, 1000) 
                } else {
                  console.log('lights are now off message');
                  // if(firstIteration)
                  // {
                  //   return 'The lights were already off.';
                  // }
                  bot.startConversation(message,function(err,convo)
                  {

                    convo.say('The bathroom is now vacant.');
                  })
            }

        } else {
            console.log('Module not connected');
            setTimeout(refresh, 1000) 
        }
        
    }
  })
})

  
  // simple example of implementing conversation
  // controller.hears(['color'], 'direct_message,live_chat,channel,private_channel', function (bot, message) {
  //   bot.startConversation(message, function (err, convo) {
  //     convo.say('This is an example of using convo.ask with a single callback without use Botkit API.')
  //     convo.say('To remove-me please got to /components/local_conversations.js')
  //     convo.ask('What is your favorite color?', function (response, convo) {
  //       convo.say('Cool, I like ' + response.text + ' too!')
  //       convo.next()
  //     })
  //   })
  // })
}
