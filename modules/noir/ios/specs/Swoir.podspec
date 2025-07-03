Pod::Spec.new do |spec|

  spec.name         = "Swoir"
  spec.version      = "1.0.0"
  spec.summary      = "Noir for swift"

  spec.homepage     = "https://github.com/rarimo/Swoir"
  spec.license      = "MIT"
  spec.author       = { "madztheo" => "" }
  spec.platform = :ios
  spec.ios.deployment_target = "14.0"

  spec.source          = {
    :git    => 'https://github.com/rarimo/Swoir.git',
    :commit => '59bf91879d5aca5c275d6c646f65d47c97fa14eb'
  }

  spec.source_files  = "Sources/**/*.{swift}"

  spec.swift_version = "5.0"

  # spec.dependency "OpenSSL-Universal", '1.1.1900'
  # spec.xcconfig          = { 'OTHER_LDFLAGS' => '-weak_framework CryptoKit -weak_framework CoreNFC -weak_framework CryptoTokenKit' }

  spec.pod_target_xcconfig = {
    'EXCLUDED_ARCHS[sdk=iphonesimulator*]' => 'arm64'
  }
  spec.user_target_xcconfig = { 'EXCLUDED_ARCHS[sdk=iphonesimulator*]' => 'arm64' }

end
