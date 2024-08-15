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

- (NSData *)dataFromHexString:(NSString *)hexString {
    NSMutableData *data = [[NSMutableData alloc] init];
    unsigned char wholeByte;
    char byteChars[3] = {'\0','\0','\0'};
    int i;
    for (i = 0; i < [hexString length] / 2; i++) {
        byteChars[0] = [hexString characterAtIndex:i * 2];
        byteChars[1] = [hexString characterAtIndex:i * 2 + 1];
        wholeByte = strtol(byteChars, NULL, 16);
        [data appendBytes:&wholeByte length:1];
    }
    return data;
}

- (void)calculateEventNullifierInt:(NSString *)event secretKey:(NSString *)secretKey resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    NSError *error = nil;

    // Convert secretKey from NSString to NSData
    NSData *secretKeyData = [self dataFromHexString:secretKey];

    // Create an instance of IdentityProfile
    IdentityProfile *profile = [[IdentityProfile alloc] init];

    // Initialize the profile with the secret key
    IdentityProfile *newProfile = [profile newProfile:secretKeyData error:&error];
    
    if (error) {
        NSLog(@"Error: %@", error.localizedDescription);
        reject(@"profile_error", @"There was an error creating the profile", error);
    }

    NSString *eventID = event;
    NSString *result = [newProfile calculateEventNullifierInt:eventID error:&error];

    if (error) {
        NSLog(@"Error: %@", error.localizedDescription);
        reject(@"event_nullifier_error", @"There was an error calculating the event nullifier", error);
    } else {
        NSLog(@"Result: %@", result);
        resolve(result);
    }
}



- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeRmoIdentitySpecJSI>(params);
}
#endif

@end
