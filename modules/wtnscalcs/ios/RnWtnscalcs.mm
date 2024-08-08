#import "RnWtnscalcs.h"
#import "WtnsUtils.h"

@implementation RnWtnscalcs
RCT_EXPORT_MODULE()

// Don't compile this code when we build for the old architecture.
#ifdef RCT_NEW_ARCH_ENABLED
- (NSNumber *)multiply:(double)a b:(double)b {
    NSNumber *result = @(rnwtnscalcs::multiply(a, b));

    return result;
}

- (void)generateAuthWtns:(NSString *)jsonInputsBase64 resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    NSError *error = nil;
    
    // Convert base64 encoded string to NSData
    NSData *jsonData = [[NSData alloc] initWithBase64EncodedString:jsonInputsBase64 options:0];
    
    if (!jsonData) {
        reject(@"error", @"Failed to decode base64 string", nil);
        return;
    }
    
    NSData *result = [WtnsUtils calcWtnsAuth:jsonData error:&error];

    if (error) {
        NSLog(@"Error: %@", error.localizedDescription);
        reject(@"error", error.localizedDescription, error);
    } else {
        // Encode result to base64 and resolve
        NSString *resultBase64 = [result base64EncodedStringWithOptions:0];
        
        resolve(resultBase64);
    }
}


- (NSNumber *)plus:(double)a b:(double)b {
    NSNumber *result = @(rnwtnscalcs::plus(a, b));
    
    return result;
}


- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeRnWtnscalcsSpecJSI>(params);
}
#endif

@end
