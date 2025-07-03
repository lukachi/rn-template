Pod::Spec.new do |spec|

  spec.name         = "SwoirCore"
  spec.version      = "0.7.1"
  spec.summary      = "SwoirCore for swift"

  spec.homepage     = "https://github.com/Swoir/SwoirCore"
  spec.license      = "MIT"
  spec.author       = { "madztheo" => "" }
  spec.platform = :ios
  spec.ios.deployment_target = "14.0"

  spec.source        = {
    :git    => 'https://github.com/Swoir/SwoirCore.git',
    :tag => '0.7.1'
  }

  spec.source_files  = "Sources/**/*.{swift}"

  spec.swift_version = "5.0"

  spec.dependency "OpenSSL-Universal", '1.1.1900'
  # spec.xcconfig          = { 'OTHER_LDFLAGS' => '-weak_framework CryptoKit -weak_framework CoreNFC -weak_framework CryptoTokenKit' }

  spec.pod_target_xcconfig = {
    'EXCLUDED_ARCHS[sdk=iphonesimulator*]' => 'arm64'
  }
  spec.user_target_xcconfig = { 'EXCLUDED_ARCHS[sdk=iphonesimulator*]' => 'arm64' }

end
