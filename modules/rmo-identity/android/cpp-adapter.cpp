#include <jni.h>
#include "rmo-identity.h"

extern "C"
JNIEXPORT jdouble JNICALL
Java_com_rmoidentity_RmoIdentityModule_nativeMultiply(JNIEnv *env, jclass type, jdouble a, jdouble b) {
    return rmoidentity::multiply(a, b);
}
