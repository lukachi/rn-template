#include <jni.h>
#include "rn-wtnscalcs.h"

extern "C"
JNIEXPORT jdouble JNICALL
Java_com_rnwtnscalcs_RnWtnscalcsModule_nativeMultiply(JNIEnv *env, jclass type, jdouble a, jdouble b) {
    return rnwtnscalcs::multiply(a, b);
}
