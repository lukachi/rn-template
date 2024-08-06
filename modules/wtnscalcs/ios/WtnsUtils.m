//
//  WtnsUtils.m
//  rn-wtnscalcs
//
//  Created by Lukachi Sama on 05.08.2024.
//

#import <Foundation/Foundation.h>
#import "WtnsUtils.h"

@implementation WtnsUtils

static const NSUInteger ERROR_SIZE = 256;
static const unsigned long WITNESS_SIZE = 100 * 1024 * 1024;

+ (void)initialize {
    if (self == [WtnsUtils self]) {
        NSLog(@"WtnsUtils initialized");
    }
}

+ (NSData *)calcWtnsAuth:(NSData *)privateInputsJson error:(NSError **)error {
    NSBundle *bundle = [NSBundle bundleWithIdentifier:@"org.cocoapods.RnWtnscalcsDatAssets"];
    
    // Check if bundle is loaded correctly
    if (!bundle) {
        NSLog(@"Bundle not found");
        if (error) {
            *error = [NSError errorWithDomain:@"WtnsUtilsErrorDomain" code:1 userInfo:@{NSLocalizedDescriptionKey: @"Resource bundle not found"}];
        }
        return nil;
    }
    
    // Attempt to load the data asset
    NSDataAsset *authDat = [[NSDataAsset alloc] initWithName:@"authDat" bundle:bundle];
    if (!authDat) {
        NSLog(@"authDat file not found in bundle");
        if (error) {
            *error = [NSError errorWithDomain:@"WtnsUtilsErrorDomain" code:1 userInfo:@{NSLocalizedDescriptionKey: @"authDat file not found in bundle"}];
        }
        return nil;
    }
    
    return [self _calcWtnsAuth:authDat.data privateInputsJson:privateInputsJson error:error];
}

+ (NSData *)_calcWtnsAuth:(NSData *)descriptionFileData privateInputsJson:(NSData *)privateInputsJson error:(NSError **)error {
    unsigned long *wtnsSize = (unsigned long *)malloc(sizeof(unsigned long));
    *wtnsSize = WITNESS_SIZE;
    char *wtnsBuffer = (char *)malloc(WITNESS_SIZE);
    char *errorBuffer = (char *)malloc(ERROR_SIZE);
    
    int result = witnesscalc_auth(
      [descriptionFileData bytes], (unsigned long)[descriptionFileData length],
      [privateInputsJson bytes], (unsigned long)[privateInputsJson length],
      wtnsBuffer, wtnsSize,
      errorBuffer, ERROR_SIZE);

    if (result != WITNESSCALC_OK) {
        [self handleWitnessError:result errorBuffer:errorBuffer wtnsSize:wtnsSize error:error];
        free(wtnsSize);
        free(wtnsBuffer);
        free(errorBuffer);
        return nil;
    }

    NSData *resultData = [NSData dataWithBytes:wtnsBuffer length:(NSUInteger)*wtnsSize];
    free(wtnsSize);
    free(wtnsBuffer);
    free(errorBuffer);
    return resultData;
}

+ (void)handleWitnessError:(int32_t)result errorBuffer:(char *)errorBuffer wtnsSize:(unsigned long *)wtnsSize error:(NSError **)error {
    if (result == WITNESSCALC_ERROR) {
        NSString *errorMessage = [[NSString alloc] initWithBytes:errorBuffer length:ERROR_SIZE encoding:NSUTF8StringEncoding];
        if (errorMessage) {
            errorMessage = [errorMessage stringByReplacingOccurrencesOfString:@"\0" withString:@""];
            if (error) {
                *error = [NSError errorWithDomain:@"com.example.WtnsUtils" code:result userInfo:@{NSLocalizedDescriptionKey: errorMessage}];
            }
        }
    } else if (result == WITNESSCALC_ERROR_SHORT_BUFFER) {
        NSString *errorMessage = [NSString stringWithFormat:@"Buffer too short, should be at least: %lu", *wtnsSize];
        if (error) {
            *error = [NSError errorWithDomain:@"com.example.WtnsUtils" code:result userInfo:@{NSLocalizedDescriptionKey: errorMessage}];
        }
    }
}

@end
