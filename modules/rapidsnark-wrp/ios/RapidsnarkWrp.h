
#ifdef RCT_NEW_ARCH_ENABLED
#import "RNRapidsnarkWrpSpec.h"

@interface RapidsnarkWrp : NSObject <NativeRapidsnarkWrpSpec>
#else
#import <React/RCTBridgeModule.h>

@interface RapidsnarkWrp : NSObject <RCTBridgeModule>
#endif

@end
