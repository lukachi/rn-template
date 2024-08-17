//
//  WtnsUtils.h
//  Pods
//
//  Created by Lukachi Sama on 05.08.2024.
//

#ifndef WtnsUtils_h
#define WtnsUtils_h

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "witnesscalc_auth.h"

//NS_ASSUME_NONNULL_BEGIN

@interface WtnsUtils : NSObject

+ (NSData *)calcWtnsAuth:(NSData *)privateInputsJson error:(NSError **)error;

@end

//NS_ASSUME_NONNULL_END

#endif /* WtnsUtils_h */
