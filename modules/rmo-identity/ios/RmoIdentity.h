
#ifdef RCT_NEW_ARCH_ENABLED
#import "RNRmoIdentitySpec.h"

@interface RmoIdentity : NSObject <NativeRmoIdentitySpec>
#else
#import <React/RCTBridgeModule.h>

@interface RmoIdentity : NSObject <RCTBridgeModule>
#endif

@end
