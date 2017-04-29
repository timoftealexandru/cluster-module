var cluster = require('cluster');
var http = require('http');
var numWorkers = 2;
process.env.PORT = 8080;
process.env.IP = '127.0.0.1';

if(cluster.isMaster){
	//fork workers.
	for(var i=0; i<numWorkers; i++){
		console.log('master: about to fork a worker');
		cluster.fork();
	}
	
	cluster.on('fork',function(worker){
		console.log('master: fork event (worker ' + worker.id + ')');
	});

	cluster.on('online',function(worker){
		console.log('master: online event (worker ' + worker.id + ')');
	});
		
	cluster.on('listening',function(worker,address){
		console.log('master: listening event (worker ' + worker.id + ' pid '+ worker.process.pid + ', ' + address.address + ' : ' + address.port + ')');
	});

	cluster.on('exit', function(worker, code, signal){
		console.log('master:exit event (worker ' + worker.id + ')');
	});
}else{
	console.log('worker: worker#' + cluster.worker.id + ' ready!');

	var count = 0;

	//workers can share TCP connection
	// in this case its a HTTP server
	http.createServer(function(req,res){
		res.writeHead(200);
		count++;	

		console.log('worker #' + cluster.worker.id + ' is incrementing count to  ' + count);
		res.end('hello workd from worker #' + cluster.worker.id + '(pid ' + cluster.worker.process.id + ') with count = ' + count + '\n' );
		if(count === 3){
			cluster.worker.destroy();
		}
	}).listen(process.env.PORT, process.env.IP);
}
		
