package expo.modules.tfexec

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import org.tensorflow.lite.Interpreter
import java.io.File
import java.nio.ByteBuffer
import java.nio.ByteOrder

class TfExecModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("TfExec")

    AsyncFunction("execTFLite") { modelSrc: String, inputs: Array<String> ->
      try {
        // Convert file:// URL to path
        val modelPath = modelSrc.replace("file://", "")
        val modelFile = File(modelPath)

        if (!modelFile.exists()) {
          throw Error("Model file not found at path: $modelPath")
        }

        // Create interpreter
        val interpreter = Interpreter(modelFile)

        // Get input and output tensor details
        val inputTensor = interpreter.getInputTensor(0)
        val outputTensor = interpreter.getOutputTensor(0)

        // Convert string inputs to floats
        val inputArray = inputs.map { it.toFloatOrNull() ?: 0f }.toFloatArray()

        // Prepare input buffer
        val inputBuffer = ByteBuffer.allocateDirect(inputArray.size * 4)  // 4 bytes per float
          .order(ByteOrder.nativeOrder())
        inputArray.forEach { inputBuffer.putFloat(it) }
        inputBuffer.rewind()

        // Prepare output buffer with correct size
        val outputSize = outputTensor.numBytes()
        val outputBuffer = ByteBuffer.allocateDirect(outputSize)
          .order(ByteOrder.nativeOrder())

        // Run inference
        interpreter.run(inputBuffer, outputBuffer)

        // Convert output to bytes
        outputBuffer.rewind()
        val outputBytes = ByteArray(outputBuffer.remaining())
        outputBuffer.get(outputBytes)

        interpreter.close()

        return@AsyncFunction outputBytes
      } catch (e: Exception) {
        throw Error("TensorFlow execution failed: ${e.message}")
      }
    }
  }
}
