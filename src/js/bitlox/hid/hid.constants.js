/* jshint -W112 */

(function(window, angular) {
    'use strict';

    angular.module('hid')
        .constant('VENDOR_ID', 0x03EB)
        .constant('PRODUCT_ID', 0x204F)
        .constant('PROTO_STRING', '// ../../generator-bin/protoc --nanopb_out=. messages.proto\n// package Device;\n\n//  import "nanopb.proto"; // commented out for ProtoBuf.js use -- hmm, perhaps should include it!\n\n// Specifies algorithm used for deterministic wallet.\nenum Algorithm\n{\n	// See https://en.bitcoin.it/wiki/BIP_0032\n	BIP32 = 0;\n	// Note that we are unlikely to support Electrum\'s determinstic\n	// wallet algorithm.\n	ELECTRUM = 1;\n}\n\n// Reset state of wallet. If a wallet is loaded, this message will unload\n// (lock) it.\n//\n// Direction: Host to Device\n// Responses: Features\nmessage Initialize\n{\n	// Arbitrary session identifier, which will be echoed back in the response\n	// (a Features message).\n    required bytes session_id = 1;\n}\n\n// List of features supported by the device.\n//\n// Direction: Device To Host\n// Responses: none\nmessage Features\n{\n	// Echoed from Initialize message.\n	required bytes echoed_session_id = 1;\n	// Name of the manufacturer eg. "Aperture Science".\n	optional string vendor = 2;\n	// Major version number of the device eg. 0.\n	optional uint32 major_version = 3;\n	// Minor version number of the device eg. 9.\n	optional uint32 minor_version = 4;\n	// Vendor-specific configuration information (eg. firmware build options).\n	optional string config = 5;\n	// Whether device is able to use OtpRequest interjections.\n	optional bool otp = 6;\n	// Whether device is able to use PinRequest interjections.\n	optional bool pin = 7;\n	// Whether device expects supporting transactions to be included when\n	// signing a transaction.\n	optional bool spv = 8;\n	// List of supported deterministic wallet algorithms.\n	repeated Algorithm algo = 9;\n	// Whether DebugLink is enabled. Production builds will never have\n	// DebugLink enabled.\n	optional bool debug_link = 10;\n	// Has device been formatted?\n	optional bool is_formatted = 11;\n	// device name\n	optional bytes device_name = 12;\n}\n\n// Check whether device is still alive.\n//\n// Direction: Host to Device\n// Responses: PingResponse\nmessage Ping\n{\n	// Arbitrary greeting which will be echoed back in the response\n	// (PingResponse message).\n	optional string greeting = 1;\n}\n\n// Response to Ping message which indicates to the host that the device is\n// still alive.\n//\n// Direction: Device To Host\n// Responses: none\nmessage PingResponse\n{\n	// Echoed from Ping message.\n	optional string echoed_greeting = 1;\n	// Echoed from most recent Initialize message. The host can use this as\n	// a sanity check to ensure the device hasn\'t reset itself in the middle\n	// of a session. If Initialize hasn\'t been called since reset, this will\n	// be filled with 00s.\n	required bytes echoed_session_id = 2;\n}\n\n// Responses: none\nmessage Success\n{\n}\n\n// Responses: none\nmessage Failure\n{\n	// Numeric identifier of error.\n	required uint32 error_code = 1;\n	// Human-readable description of error.\n	required string error_message = 2;\n}\n\n// Interjection sent from the device to the host specifying that a button\n// press (on the device) is required in order to continue.\n// Responses: ButtonAck or ButtonCancel\nmessage ButtonRequest\n{\n}\n\n// Host grants permission for device to wait for button press.\nmessage ButtonAck\n{\n}\n\n// Host denies permission for device to wait for button press. This will\n// probably cause the current action to be cancelled.\nmessage ButtonCancel\n{\n}\n\n// Interjection sent from the device to the host specifying that an action\n// requires a password to be submitted to the device.\nmessage PinRequest\n{\n}\n\n// Host submits password to the device.\nmessage PinAck\n{\n	required bytes password = 1;\n}\n\n// Host does not want to submit password to the device.\nmessage PinCancel\n{\n}\n\nmessage OtpRequest\n{\n}\n\nmessage OtpAck\n{\n	required string otp = 1;\n}\n\nmessage OtpCancel\n{\n}\n\n// Delete a wallet, making space for another one. Deleting a wallet does not\n// require that wallet to be loaded. Thus it is possible to delete a wallet\n// that you don\'t own.\n//\n// Direction: Host to Device\n// Responses: Success or Failure\n// Response interjections: ButtonRequest, OtpRequest\nmessage DeleteWallet\n{\n	// Which wallet to delete.\n	optional uint32 wallet_handle = 1;\n}\n\n// Responses: Success or Failure\n// Response interjections: ButtonRequest\n// wallet_name is stored purely for the convenience of the host. It should be\n// a null-terminated UTF-8 encoded string with a maximum length of 40 bytes.\n// To create an unencrypted wallet, exclude password.\nmessage NewWallet\n{\n	optional uint32 wallet_number = 1;\n	optional bytes password = 2;\n	optional bytes wallet_name = 3;\n	optional bool is_hidden = 4 ;\n}\n\n// Responses: Address or Failure\n// Response interjections: ButtonRequest\nmessage NewAddress\n{\n}\n\n// Responses: none\nmessage Address\n{\n	required uint32 address_handle = 1;\n	required bytes public_key = 2;\n	required bytes address = 3;\n}\n\n// Responses: none\nmessage AddressPubKey\n{\n	required bytes public_key = 1;\n}\n\n\n// Responses: NumberOfAddresses or Failure\nmessage GetNumberOfAddresses\n{\n}\n\n// Responses: none\nmessage NumberOfAddresses\n{\n	required uint32 number_of_addresses = 1;\n}\n\n// Responses: Address or Failure\nmessage GetAddressAndPublicKey\n{\n	required uint32 address_handle = 1;\n}\n\n// Responses: Signature or Failure\n// Response interjections: ButtonRequest\nmessage SignTransaction\n{\n	required uint32 address_handle = 1;\n	required bytes transaction_data = 2;\n}\n\nmessage AddressHandleExtended\n{\n	required uint32 address_handle_root = 1;\n	required uint32 address_handle_chain = 2;\n	required uint32 address_handle_index = 3;\n}\n\n// Responses: Signature or Failure\n// Response interjections: ButtonRequest\nmessage SignTransactionExtended\n{\n	repeated AddressHandleExtended address_handle_extended = 1;\n	required bytes transaction_data = 2;\n	optional AddressHandleExtended change_address = 3;\n}\n\n\n\n\n// Responses: none\nmessage Signature\n{\n	required bytes signature_data = 1;\n}\n\n// Responses: none\nmessage SignatureCompleteData\n{\n	required bytes signature_data_complete = 1;\n}\n\nmessage SignatureComplete\n{\n	repeated SignatureCompleteData signature_complete_data = 1;\n}\n\n// Responses: Success or Failure\n// Response interjections: PinRequest\nmessage LoadWallet\n{\n	optional uint32 wallet_number = 1 ;\n}\n\n// Responses: Success or Failure\n// Response interjections: ButtonRequest\nmessage FormatWalletArea\n{\n	required bytes initial_entropy_pool = 1;\n}\n\n// Responses: Success or Failure\n// Response interjections: ButtonRequest\n// To change the current wallet into an unencrypted wallet,\n// exclude password.\nmessage ChangeEncryptionKey\n{\n	optional bytes password = 1;\n}\n\n// Responses: Success or Failure\n// Response interjections: ButtonRequest\n// wallet_name is stored purely for the convenience of the host. It should be\n// a null-terminated UTF-8 encoded string with a maximum length of 40 bytes.\nmessage ChangeWalletName\n{\n	required bytes wallet_name = 1;\n}\n\n// Responses: Success or Failure\n// Response interjections: ButtonRequest\n// device_name is stored purely for the convenience of the host. It should be\n// a null-terminated UTF-8 encoded string with a maximum length of 40 bytes.\nmessage ChangeDeviceName\n{\n	required bytes device_name = 1;\n}\n\n// Responses: Wallets or Failure\nmessage ListWallets\n{\n}\n\n// Responses: none\nmessage WalletInfo\n{\n	required uint32 wallet_number = 1;\n	required bytes wallet_name = 2;\n	required bytes wallet_uuid = 3;\n	optional uint32 version = 4;\n}\n\n// Responses: none\nmessage Wallets\n{\n	repeated WalletInfo wallet_info = 1;\n}\n\n// Responses: Success or Failure\n// Response interjections: ButtonRequest\nmessage BackupWallet\n{\n	optional bool is_encrypted = 1 ;\n	optional uint32 device = 2 ;\n}\n\n// Responses: Success or Failure\n// Response interjections: ButtonRequest\nmessage RestoreWallet\n{\n	required NewWallet new_wallet = 1;\n	required bytes seed = 2;\n}\n\n// Responses: DeviceUUID or Failure\nmessage GetDeviceUUID\n{\n}\n\n// Responses: none\nmessage DeviceUUID\n{\n	required bytes device_uuid = 1;\n}\n\n// Responses: Entropy or Failure\nmessage GetEntropy\n{\n	required uint32 number_of_bytes = 1;\n}\n\n// Responses: none\nmessage Entropy\n{\n	required bytes entropy = 1;\n}\n\n// Responses: MasterPublicKey or Failure\n// Response interjections: ButtonRequest\nmessage GetMasterPublicKey\n{\n}\n\n// Responses: none\nmessage MasterPublicKey\n{\n	required bytes public_key = 1;\n	required bytes chain_code = 2;\n}\n\n// Host requests language choice menu.\nmessage ResetLang\n{\n}\n\n// Host requests PIN change (device must be loaded & will have to input current).\nmessage ResetPIN\n{\n}\n\n// Responses: Entropy or Failure\nmessage GetBulk\n{\n}\n\n// Responses: none\nmessage Bulk\n{\n	required bytes bulk = 1;\n}\n\n// Responses: none\nmessage SetBulk\n{\n	required bytes bulk = 1;\n}\n\n\n// Host requests wallet scan.\nmessage ScanWallet\n{\n}\n\nmessage CurrentWalletXPUB\n{\n	required string xpub = 1;\n}\n\nmessage SignMessage\n{\n	required AddressHandleExtended address_handle_extended = 1;\n	optional bytes message_data = 2;\n}\n\n// Responses: none\nmessage SignatureMessage\n{\n	required bytes signature_data_complete = 1;\n}\n\n//Will always take from root 0 chain 1\nmessage SetChangeAddressIndex\n{\n	optional uint32 address_handle_index = 1;\n}\n\n//Will always take from root 0 chain 0\nmessage DisplayAddressAsQR\n{\n	optional uint32 address_handle_index = 1;\n}');

})(window, window.angular);
