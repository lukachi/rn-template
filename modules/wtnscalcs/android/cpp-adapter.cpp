#include <jni.h>
#include "rn-wtnscalcs.h"
#include "witnesscalc_auth.h"

extern "C"
JNIEXPORT jdouble JNICALL
Java_com_rnwtnscalcs_RnWtnscalcsModule_nativeMultiply(JNIEnv *env, jclass type, jdouble a, jdouble b) {
    return rnwtnscalcs::multiply(a, b);
}

extern "C"
JNIEXPORT jint JNICALL
Java_com_rnwtnscalcs_WtnsUtil_auth(JNIEnv *env, jobject thiz, jbyteArray circuit_buffer,
                                   jlong circuit_size, jbyteArray json_buffer, jlong json_size,
                                   jbyteArray wtns_buffer, jlongArray wtns_size,
                                   jbyteArray error_msg, jlong error_msg_max_size) {
    const char *circuitBuffer = reinterpret_cast<const char *>(env->GetByteArrayElements(
            circuit_buffer, nullptr));
    const char *jsonBuffer = reinterpret_cast<const char *>(env->GetByteArrayElements(json_buffer,
                                                                                      nullptr));
    char *wtnsBuffer = reinterpret_cast<char *>(env->GetByteArrayElements(wtns_buffer, nullptr));
    char *errorMsg = reinterpret_cast<char *>(env->GetByteArrayElements(error_msg, nullptr));

    unsigned long wtnsSize = env->GetLongArrayElements(wtns_size, nullptr)[0];


    int result = witnesscalc_auth(
            circuitBuffer, static_cast<unsigned long>(circuit_size),
            jsonBuffer, static_cast<unsigned long>(json_size),
            wtnsBuffer, &wtnsSize,
            errorMsg, static_cast<unsigned long>(error_msg_max_size));

    // Set the result and release the resources
    env->SetLongArrayRegion(wtns_size, 0, 1, reinterpret_cast<jlong *>(&wtnsSize));

    env->ReleaseByteArrayElements(circuit_buffer,
                                  reinterpret_cast<jbyte *>(const_cast<char *>(circuitBuffer)), 0);
    env->ReleaseByteArrayElements(json_buffer,
                                  reinterpret_cast<jbyte *>(const_cast<char *>(jsonBuffer)), 0);
    env->ReleaseByteArrayElements(wtns_buffer, reinterpret_cast<jbyte *>(wtnsBuffer), 0);
    env->ReleaseByteArrayElements(error_msg, reinterpret_cast<jbyte *>(errorMsg), 0);

    return result;
}
