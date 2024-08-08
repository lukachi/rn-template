#ifdef __cplusplus
#import "rn-wtnscalcs.h"
#endif

#ifdef RCT_NEW_ARCH_ENABLED
#import "RNRnWtnscalcsSpec.h"

@interface RnWtnscalcs : NSObject <NativeRnWtnscalcsSpec>
#else
#import <React/RCTBridgeModule.h>

@interface RnWtnscalcs : NSObject <RCTBridgeModule>
#endif

@end
