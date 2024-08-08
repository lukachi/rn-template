#import "RmoIdentity.h"
#import <Identity/Identity.h>

@implementation RmoIdentity
RCT_EXPORT_MODULE()

// Don't compile this code when we build for the old architecture.
#ifdef RCT_NEW_ARCH_ENABLED
- (NSNumber *)multiply:(double)a b:(double)b {
    NSNumber *result = @(rmoidentity::multiply(a, b));

    return result;
}

- (void)generatePrivateKey:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    NSData *secretKey = IdentityNewBJJSecretKey();
    if (secretKey) {
        resolve([secretKey base64EncodedStringWithOptions:0]);
    } else {
        NSError *error = [NSError errorWithDomain:@"RnWtnscalcs" code:500 userInfo:@{NSLocalizedDescriptionKey: @"Failed to generate secret key"}];
        reject(@"no_key", @"There was no key generated", error);
    }
}


- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeRmoIdentitySpecJSI>(params);
}
#endif

@end
