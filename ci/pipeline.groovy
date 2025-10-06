pipeline {
    agent any

    options {
        // Job'ları seri çalıştır - aynı job'a birden fazla istek gelirse sıraya girer
        disableConcurrentBuilds(abortPrevious: false)
        // Build timeout süresi
        timeout(time: 30, unit: 'MINUTES')
        // Workspace temizleme
        skipDefaultCheckout()
    }

    parameters {
        string(name: 'CODE',        defaultValue: '',  description: 'Soru Grubu Kodu')
        string(name: 'GROUP_NAME',  defaultValue: '',  description: 'Soru Grubu Adı')
        string(name: 'API_TOKEN',   defaultValue: '',  description: 'API Token')
        string(name: 'GROUP_ID',    defaultValue: '',  description: 'Soru Grubu ID')
        string(name: 'GAME_ID',     defaultValue: '1', description: 'Oyun ID (1:jeopardy,2:bilgi-carki,3:web-oyun,4:tower-game,5:yol-macerasi,6:puan-merdiveni)')
    }
    environment {
        API_BASE_URL = 'https://etkinlik.app/api'
        CALLBACK_URL = "${API_BASE_URL}/jenkins/callback"
    }

    stages {
        stage('Queue Control & Build Info') {
            steps {
                script {
                    echo "=== BUILD SIRA KONTROLÜ ==="
                    echo "Build Number: ${env.BUILD_NUMBER}"
                    echo "Build ID: ${env.BUILD_ID}"
                    echo "Job Name: ${env.JOB_NAME}"
                    echo "Timestamp: ${new Date()}"
                    echo "Bu build çalışıyor, disableConcurrentBuilds ile diğerleri bekliyor..."
                    echo "=========================="

                    // Basit bir dosya bazlı mutex sistemi
                    def lockFile = "/tmp/etkinlik-app-build.lock"
                    def maxWaitTime = 300 // 5 dakika
                    def waitTime = 0

                    // Lock dosyası varsa bekle
                    while (sh(script: "test -f ${lockFile}", returnStatus: true) == 0 && waitTime < maxWaitTime) {
                        echo "Başka bir build çalışıyor, bekleniyor... (${waitTime}/${maxWaitTime} saniye)"
                        sleep(time: 10, unit: 'SECONDS')
                        waitTime += 10
                    }

                    if (waitTime >= maxWaitTime) {
                        error "Lock dosyası çok uzun süre mevcut, build iptal ediliyor"
                    }

                    // Lock dosyası oluştur
                    sh "echo '${env.BUILD_NUMBER}:${env.BUILD_ID}' > ${lockFile}"
                    echo "Lock alındı: ${env.BUILD_NUMBER}"
                }
            }
        }

        stage('Determine Game Type') {
            steps {
                script {
                    def gameType      = 'jeopardy'
                    def buildPath     = '/home/etknlkapp/public_html/jeopardy'
                    def iframeBaseUrl = 'https://etkinlik.app/jeopardy/index.html'
                    def zipOutputDir  = '/home/etknlkapp/public_html/jeopardy/zips'
                    def zipBaseUrl    = 'https://etkinlik.app/jeopardy/zips'

                    if (params.GAME_ID == '2') {
                        gameType      = 'bilgi-carki'
                        buildPath     = '/home/etknlkapp/public_html/bilgi-carki'
                        iframeBaseUrl = 'https://etkinlik.app/bilgi-carki/index.html'
                        zipOutputDir  = '/home/etknlkapp/public_html/bilgi-carki/zips'
                        zipBaseUrl    = 'https://etkinlik.app/bilgi-carki/zips'
                    }
                    if (params.GAME_ID == '3') {
                        gameType      = 'web-oyun'
                        buildPath     = '/home/etknlkapp/public_html/web-oyun'
                        iframeBaseUrl = 'https://etkinlik.app/web-oyun/index.html'
                        zipOutputDir  = '/home/etknlkapp/public_html/web-oyun/zips'
                        zipBaseUrl    = 'https://etkinlik.app/web-oyun/zips'
                    }
                    if (params.GAME_ID == '4') {
                        gameType      = 'tower-game'
                        buildPath     = '/home/etknlkapp/public_html/tower-game'
                        iframeBaseUrl = 'https://etkinlik.app/tower-game/index.html'
                        zipOutputDir  = '/home/etknlkapp/public_html/tower-game/zips'
                        zipBaseUrl    = 'https://etkinlik.app/tower-game/zips'
                    }
                    if (params.GAME_ID == '5') {
                        gameType      = 'yol-macerasi'
                        buildPath     = '/home/etknlkapp/public_html/yol-macerasi'
                        iframeBaseUrl = 'https://etkinlik.app/yol-macerasi/index.html'
                        zipOutputDir  = '/home/etknlkapp/public_html/yol-macerasi/zips'
                        zipBaseUrl    = 'https://etkinlik.app/yol-macerasi/zips'
                    }
                    if (params.GAME_ID == '6') {
                        gameType      = 'puan-merdiveni'
                        buildPath     = '/home/etknlkapp/public_html/puan-merdiveni'
                        iframeBaseUrl = 'https://etkinlik.app/puan-merdiveni/index.html'
                        zipOutputDir  = '/home/etknlkapp/public_html/puan-merdiveni/zips'
                        zipBaseUrl    = 'https://etkinlik.app/puan-merdiveni/zips'
                    }

                    env.GAME_TYPE      = gameType
                    env.BUILD_PATH     = buildPath
                    env.IFRAME_URL     = "${iframeBaseUrl}?code=${params.CODE}"
                    env.ZIP_OUTPUT_DIR = zipOutputDir
                    env.ZIP_BASE_URL   = zipBaseUrl

                    echo "GAME_TYPE: ${env.GAME_TYPE}"
                    echo "BUILD_PATH: ${env.BUILD_PATH}"
                    echo "IFRAME_URL: ${env.IFRAME_URL}"
                    echo "ZIP_OUTPUT_DIR: ${env.ZIP_OUTPUT_DIR}"
                    echo "ZIP_BASE_URL: ${env.ZIP_BASE_URL}"
                }
            }
        }

        stage('Validate Build Path') {
            steps {
                sh """
                set -e
                echo "=== BUILD PATH VALIDATION ==="
                echo "HOSTNAME:"; hostname
                echo "PWD:"; pwd
                echo "Kullanıcı kimliği:"; id

                # Bilgi amaçlı; erişim yoksa pipeline düşmesin:
                ls -la /home/etknlkapp/public_html/ 2>/dev/null || echo "public_html listelenemiyor (izin)"
                ls -la /home/etknlkapp/public_html/jeopardy 2>/dev/null || echo "jeopardy yok veya erişim yok"
                ls -la /home/etknlkapp/public_html/bilgi-carki 2>/dev/null || echo "bilgi-carki yok veya erişim yok"
                ls -la /home/etknlkapp/public_html/web-oyun 2>/dev/null || echo "web-oyun yok veya erişim yok"
                ls -la /home/etknlkapp/public_html/tower-game 2>/dev/null || echo "tower-game yok veya erişim yok"
                ls -la /home/etknlkapp/public_html/yol-macerasi 2>/dev/null || echo "yol-macerasi yok veya erişim yok"
                ls -la /home/etknlkapp/public_html/puan-merdiveni 2>/dev/null || echo "puan-merdiveni yok veya erişim yok"

                if [ ! -d "${env.BUILD_PATH}" ]; then
                    echo "HATA: Build path bulunamadı: ${env.BUILD_PATH}"
                    exit 1
                fi
                echo "Build path doğrulandı: ${env.BUILD_PATH}"

                if [ -r "${env.BUILD_PATH}" ]; then
                    echo "Dosya ağacını kontrol ediyorum:"
                    find "${env.BUILD_PATH}" | head -40 || true
                else
                    echo "UYARI: ${env.BUILD_PATH} okunamıyor (izin)"
                fi
                echo "============================="
                """
            }
        }

        stage('Process Data') {
            steps {
                script {
                    // Tüm oyunlar artık web tabanlı - webGameDataDownloader kullanacağız
                    sh """
                        set -e
                        export BUILD_PATH="${env.BUILD_PATH}"
                        export GAME_TYPE="${env.GAME_TYPE}"

                        # PUBLIC_SEGMENT belirleme - oyun tipine göre
                        if [ "${env.GAME_TYPE}" = "jeopardy" ]; then
                            PUBLIC_SEGMENT="jeopardy"
                        elif [ "${env.GAME_TYPE}" = "bilgi-carki" ]; then
                            PUBLIC_SEGMENT="bilgi-carki"
                        elif [ "${env.GAME_TYPE}" = "web-oyun" ]; then
                            PUBLIC_SEGMENT="web-oyun"
                        elif [ "${env.GAME_TYPE}" = "tower-game" ]; then
                            PUBLIC_SEGMENT="tower-game"
                        elif [ "${env.GAME_TYPE}" = "yol-macerasi" ]; then
                            PUBLIC_SEGMENT="yol-macerasi"
                        elif [ "${env.GAME_TYPE}" = "puan-merdiveni" ]; then
                            PUBLIC_SEGMENT="puan-merdiveni"
                        else
                            PUBLIC_SEGMENT="web-oyun"
                        fi
                        export PUBLIC_SEGMENT

                        echo "Web oyun verisi indiriliyor..."
                        echo "BUILD_PATH: ${env.BUILD_PATH}"
                        echo "GAME_TYPE: ${env.GAME_TYPE}"
                        echo "PUBLIC_SEGMENT: $PUBLIC_SEGMENT"

                        node /home/etknlkapp/scripts/webGameDataDownloader.js --code=${params.CODE}

                        # İzinleri düzelt
                        TARGET_DIR="${env.BUILD_PATH}/questions"
                        sudo chown -R etknlkapp:etknlkapp "$TARGET_DIR" || true
                        sudo chmod -R 775 "$TARGET_DIR" || true
                        echo "${env.GAME_TYPE} için soru ve logo dosyaları hazırlandı."
                    """
                }
            }
        }

        stage('Release Lock') {
            steps {
                script {
                    // Lock dosyasını temizle
                    sh 'rm -f /tmp/etkinlik-app-build.lock || true'
                    echo "=== BUILD TAMAMLANDI ==="
                    echo "Build Number: ${env.BUILD_NUMBER} başarıyla tamamlandı"
                    echo "Lock serbest bırakıldı"
                    echo "========================"
                }
            }
        }
    } // stages

    post {
        always {
            script {
                // Her durumda lock dosyasını temizle
                sh 'rm -f /tmp/etkinlik-app-build.lock || true'
                echo "Lock temizlendi (always)"
            }
        }
        success {
            sh '''
            #!/usr/bin/env bash
            set -e

            CODE="$CODE"
            GAME_ID="$GAME_ID"
            GROUP_ID="$GROUP_ID"
            GAME_TYPE="$GAME_TYPE"
            IFRAME_URL="$IFRAME_URL"
            ZIP_BASE_URL="$ZIP_BASE_URL"
            ZIP_OUTPUT_DIR="$ZIP_OUTPUT_DIR"
            BUILD_PATH="$BUILD_PATH"

            TEMP_DIR=$(mktemp -d -t build_${CODE}_${GAME_TYPE}_XXXXXX)

            APP_DIR="$TEMP_DIR/$GAME_TYPE"
            mkdir -p "$APP_DIR"

            # Tüm build içeriğini (zips klasörü hariç) kopyala
            shopt -s dotglob
            for item in "$BUILD_PATH"/*; do
                base=$(basename "$item")
                if [ "$base" = "zips" ]; then
                    continue
                fi
                cp -r "$item" "$APP_DIR/" || true
            done
            shopt -u dotglob

            mkdir -p "$ZIP_OUTPUT_DIR"
            cd "$TEMP_DIR"
            ZIP_FILENAME="soru-grubu-${CODE}-oyun${GAME_ID}.zip"
            zip -r "$ZIP_OUTPUT_DIR/$ZIP_FILENAME" . >/dev/null

            sudo chown etknlkapp:etknlkapp "$ZIP_OUTPUT_DIR/$ZIP_FILENAME" 2>/dev/null || {
                echo "sudo chown başarısız, grup izinleriyle devam ediliyor..."
                chgrp etknlkapp "$ZIP_OUTPUT_DIR/$ZIP_FILENAME" 2>/dev/null || true
            }
            chmod 664 "$ZIP_OUTPUT_DIR/$ZIP_FILENAME" 2>/dev/null || true

            ZIP_URL="$ZIP_BASE_URL/$ZIP_FILENAME"

            PAYLOAD="$TEMP_DIR/payload.json"
            cat > "$PAYLOAD" <<JSON
{
  "group_id": "$GROUP_ID",
  "status": "success",
  "game_id": "$GAME_ID",
  "game_type": "$GAME_TYPE",
  "iframe_url": "$IFRAME_URL",
  "zip_url": "$ZIP_URL"
}
JSON

            curl -sS -X POST "$CALLBACK_URL" \
                -H "Content-Type: application/json" \
                --data-binary @"$PAYLOAD"

            echo "ZIP ve callback başarıyla tamamlandı: $ZIP_URL"
            '''
            echo "ZIP ve iframe işlemi başarıyla tamamlandı."
        }
        failure {
            sh """
            #!/usr/bin/env bash
            set -e
            GROUP_ID='${params.GROUP_ID}'
            GAME_ID='${params.GAME_ID}'
            GAME_TYPE='${env.GAME_TYPE}'

            PAYLOAD=$(mktemp)
            cat > "$PAYLOAD" <<JSON
{
  "group_id": "$GROUP_ID",
  "status": "failed",
  "error": "Jenkins pipeline başarısız oldu.",
  "game_id": "$GAME_ID",
  "game_type": "$GAME_TYPE"
}
JSON

            curl -sS -X POST "${env.CALLBACK_URL}" \
                -H "Content-Type: application/json" \
                --data-binary @"$PAYLOAD" || true
            """
            echo "İşlem başarısız oldu."
        }
    } // post
} // pipeline
