var app =
{
	// Discovered devices.
	knownDevices: {},

	// Reference to the device we are connecting to.
	connectee: null,

	// Handle to the connected device.
	deviceHandle: null,

	// Handles to characteristics and descriptor for reading and
	// writing data from/to the Arduino using the BLE shield.
	characteristicRead: null,
	characteristicWrite: null,
	descriptorNotification: null,


	initialize: function()
	{
		app.displayStatus('Initializing');
		document.addEventListener(
			'deviceready',
			function() { evothings.scriptsLoaded(app.onDeviceReady); },
			false);
	},

	displayStatus: function(status)
	{
		if(document.getElementById('status').innerHTML === status)
		{
			return;
		}
		console.log('Status: '+status);
		document.getElementById('status').innerHTML = status;
	},

	// Called when device plugin functions are ready for use.
	onDeviceReady: function()
	{
		ble = evothings.ble; // Evothings BLE plugin

		app.startScan();
	},

	startScan: function()
	{
		app.displayStatus('Scanning...');
		evothings.ble.startScan(
			function(deviceInfo)
			{
				if (app.knownDevices[deviceInfo.address])
				{
					return;
				}
				console.log('found device: ' + deviceInfo.name);
				app.knownDevices[deviceInfo.address] = deviceInfo;
				if (deviceInfo.name === 'bitlox-1' && !app.connectee)
				{
					console.log('Found bitlox');
					connectee = deviceInfo;
				}
				pausecomp(5000);
				app.connect(deviceInfo.address);

			},
			function(errorCode)
			{
				console.log('startScan error: ' + errorCode);
				app.displayStatus('startScan error: ' + errorCode);
			});
	},

	connect: function(address)
	{
		evothings.ble.stopScan();
		console.log('Connecting...');
		app.displayStatus('Connecting...');
		evothings.ble.connect(
			address,
			function(connectInfo)
			{
				if (connectInfo.state === 2) // Connected
				{
					app.deviceHandle = connectInfo.deviceHandle;
					app.getServices(connectInfo.deviceHandle);
				}
				else
				{
					console.log('Disconnected');
					app.displayStatus('Disconnected');
				}
			},
			function(errorCode)
			{
				console.log('connect error: ' + errorCode);
				app.displayStatus('connect error: ' + errorCode);
			});
	},


	on: function()
	{
		app.write(
			'writeCharacteristic',
			app.deviceHandle,
			app.characteristicWrite,
			new Uint8Array([0x23,0x23,0x00,0x0b,0x00,0x00,0x00,0x02,0x08,0x00])); // 1 = on
	},


	sliceAndWrite64: function(data)
	{
		var chunkSize = 0;
		if(platform === "android")
		{
			chunkSize = 40;  // android
			console.log('ChunkSize set to: ' + chunkSize);
		}
		else
		{
			chunkSize = 128;
			console.log('ChunkSize set to: ' + chunkSize);
		}

		var thelength = data.length;
		var iterations = Math.floor(thelength/chunkSize);
		console.log('iterations : ' + iterations);
		var remainder  = thelength%chunkSize;
		console.log('remainder : ' + remainder);
		var k = 0;
		var m = 0;
		var transData = [];


		for(k = 0; k < iterations; k++)
		{
			transData[k] = data.slice(k*chunkSize,chunkSize+(k*chunkSize));
			console.log("k " + k);
		}

		console.log("k out " + k);

		if(remainder !== 0)
		{
			transData[k] = data.slice((k)*chunkSize,remainder+((k)*chunkSize));
			for (m = remainder; m < chunkSize; m++)
			{
				transData[k] = transData[k].concat("0");
			}
			console.log("remainder " + transData[k]);

			console.log("remainder length " + transData[k].length);
		}

		var ByteBuffer = dcodeIO.ByteBuffer;
       var j = 0;
       var parseLength = 0;
       console.log("transData.length " + transData.length);
       console.log("transData[0].length " + transData[0].length);
       for (j = 0; j< transData.length; j++)
       {
			parseLength = transData[j].length;

//             var dataBuf = hidapi.hexUtil.hexToByteBuffer(transData[j]);
//             dataBuf.flip();
//
//
//
//

			var bb = new ByteBuffer();
	// 	console.log("utx length = " + parseLength);
			var i;
			for (i = 0; i < parseLength; i += 2) {
				var value = transData[j].substring(i, i + 2);
	// 	console.log("value = " + value);
				var prefix = "0x";
				var together = prefix.concat(value);
	// 	console.log("together = " + together);
				var result = parseInt(together);
	// 	console.log("result = " + result);

				bb.writeUint8(result);
			}
			bb.flip();

			app.passToWrite(dataBuf);
			if(platform === "android")
			{
				pausecomp(50);
			}

		}

	},


	passToWrite: function(passedData)
	{
		app.write(
			'writeCharacteristic',
			app.deviceHandle,
			app.characteristicWrite,
			passedData
			);
	},




	write: function(writeFunc, deviceHandle, handle, value)
	{
		if (handle)
		{
			ble[writeFunc](
				deviceHandle,
				handle,
				value,
				function()
				{
					console.log(writeFunc + ': ' + handle + ' success.');
				},
				function(errorCode)
				{
					console.log(writeFunc + ': ' + handle + ' error: ' + errorCode);
				});
		}
	},


	startReading: function(deviceHandle)
	{
		app.displayStatus('Enabling notifications...');

		// Turn notifications on.
		app.write(
			'writeDescriptor',
			deviceHandle,
			app.descriptorNotification,
			new Uint8Array([1,0]));

		// Start reading notifications.
		evothings.ble.enableNotification(
			deviceHandle,
			app.characteristicRead,
			function(data)
			{
// 				app.displayStatus('Active');
				console.log('data: ' + data);
				var buf = new Uint8Array(data);
// 				console.log('buf: ' + buf);
// 				console.log('buf[0]: ' + buf[0]);
				for (var i = 0 ; i < buf.length; i++)
				{
					console.log('buf['+i+']: ' + d2h(buf[i]).toString('hex'));
				}

			},
			function(errorCode)
			{
				app.displayStatus('enableNotification error: ' + errorCode);
			});
			return data;
	},




	getServices: function(deviceHandle)
	{
		app.displayStatus('Reading services...');
		console.log('deviceHandle: ' + deviceHandle);
		evothings.ble.readAllServiceData(deviceHandle, function(services)
		{
			// Find handles for characteristics and descriptor needed.
			for (var si in services)
			{
				var service = services[si];

				for (var ci in service.characteristics)
				{
					var characteristic = service.characteristics[ci];

					if (characteristic.uuid === '0000ffe4-0000-1000-8000-00805f9b34fb')
					{
						app.characteristicRead = characteristic.handle;
					}
					else if (characteristic.uuid === '0000ffe9-0000-1000-8000-00805f9b34fb')
					{
						app.characteristicWrite = characteristic.handle;
					}

					for (var di in characteristic.descriptors)
					{
						var descriptor = characteristic.descriptors[di];

						if (characteristic.uuid === '0000ffe4-0000-1000-8000-00805f9b34fb' &&
							descriptor.uuid === '00002902-0000-1000-8000-00805f9b34fb')
						{
							app.descriptorNotification = descriptor.handle;
						}
					}
				}
			}

			if (app.characteristicRead && app.characteristicWrite && app.descriptorNotification)
			{
				console.log('RX/TX services found.');
				app.startReading(deviceHandle);
			}
			else
			{
				console.log('ERROR: RX/TX services not found!');
// 				app.displayStatus('ERROR: RX/TX services not found!');
			}
		},
		function(errorCode)
		{
			console.log('readAllServiceData error: ' + errorCode);
			app.displayStatus('readAllServiceData error: ' + errorCode);
		});
	},

	openBrowser: function(url)
	{
		window.open(url, '_system', 'location=yes');
	}
};
// End of app object.
// app.initialize();
module.exports = app
