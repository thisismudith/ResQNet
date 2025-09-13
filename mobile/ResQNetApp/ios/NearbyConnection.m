#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(NearbyConnection, NSObject)

RCT_EXTERN_METHOD(startDiscovery)
RCT_EXTERN_METHOD(stopDiscovery)
RCT_EXTERN_METHOD(startAdvertising)
RCT_EXTERN_METHOD(stopAdvertising)

@end