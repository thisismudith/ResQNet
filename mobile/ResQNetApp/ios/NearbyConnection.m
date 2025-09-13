#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(NearbyConnection, NSObject)

RCT_EXTERN_METHOD(startDiscovery)
RCT_EXTERN_METHOD(stopDiscovery)
RCT_EXTERN_METHOD(startAdvertising)
RCT_EXTERN_METHOD(stopAdvertising)
RCT_EXTERN_METHOD(connectToEndpoint:(NSString *)endpointId)
RCT_EXTERN_METHOD(acceptConnection:(NSString *)endpointId)
RCT_EXTERN_METHOD(rejectConnection:(NSString *)endpointId)
RCT_EXTERN_METHOD(sendMessage:(NSString *)endpointId message:(NSString *)message)
RCT_EXTERN_METHOD(disconnectFromEndpoint:(NSString *)endpointId)

@end