// @ts-nocheck
import React from 'react';
import {
    View,
    StyleSheet,
    Modal,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button } from './';
import { COLORS } from '../utils/constants';

interface TermsModalProps {
    visible: boolean;
    type: 'privacy' | 'terms';
    onClose: () => void;
}

const TermsModal = ({ visible, type, onClose }: TermsModalProps) => {
    const isPrivacy = type === 'privacy';
    const title = isPrivacy ? 'Gizlilik Politikası' : 'Kullanım Koşulları';

    const privacyContent = `
1. VERİ TOPLAMA
KadderBal uygulaması olarak, hizmetlerimizi sunabilmek için aşağıdaki bilgileri topluyoruz:
- Ad, soyad, e-posta adresi
- Doğum tarihi ve saati
- Cinsiyet, ilişki durumu, meslek
- Ülke ve şehir bilgisi
- Profil fotoğrafı (isteğe bağlı)

2. VERİ KULLANIMI
Topladığımız bilgiler şu amaçlarla kullanılmaktadır:
- Kişiselleştirilmiş burç yorumları ve fal hizmetleri sunmak
- Kullanıcı deneyimini iyileştirmek
- Uygulama içi bildirimler göndermek
- Güvenlik ve hesap yönetimi

3. VERİ GÜVENLİĞİ
Kişisel verileriniz SSL şifreleme ile korunmaktadır. Verileriniz üçüncü taraflarla paylaşılmamaktadır.

4. HAKLARINIZ
KVKK kapsamında verilerinize erişim, düzeltme, silme ve itiraz etme haklarınız bulunmaktadır.

5. İLETİŞİM
Gizlilik politikamız hakkında sorularınız için: info@kadderbal.com
    `;

    const termsContent = `
1. HİZMET KAPSAMI
KadderBal, kullanıcılara burç yorumları, fal hizmetleri ve spiritüel içerikler sunan bir platformdur.

2. KULLANICI YÜKÜMLÜLÜKLERİ
- Doğru ve güncel bilgi sağlamak
- Hesap güvenliğini korumak
- Uygulamayı yasalara uygun kullanmak
- Başkalarının haklarına saygı göstermek

3. HİZMET KULLANIMI
- Uygulama içi satın alımlar ve jeton sistemi mevcuttur
- İçerikler yalnızca kişisel kullanım içindir
- Ticari amaçlarla kullanılamaz

4. FİKRİ MÜLKİYET
Uygulama içindeki tüm içerikler KadderBal'a aittir ve telif hakkı koruması altındadır.

5. SORUMLULUK SINIRLAMASI
KadderBal, fal ve yorumların doğruluğu konusunda garanti vermemektedir. Hizmetler eğlence amaçlıdır.

6. DEĞİŞİKLİKLER
Bu sözleşme zaman zaman güncellenebilir. Değişiklikler uygulama içinde duyurulacaktır.

7. İPTAL VE İADE
Jeton satın alımları için iptal ve iade politikası geçerlidir. Detaylar için destek ekibimizle iletişime geçiniz.
    `;

    const content = isPrivacy ? privacyContent : termsContent;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}>
            <SafeAreaView style={styles.container}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{title}</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                            activeOpacity={0.7}>
                            <Text style={styles.closeIcon}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={true}>
                        <Text style={styles.content}>{content.trim()}</Text>
                    </ScrollView>

                    <View style={styles.footer}>
                        <Button
                            title="Kapat"
                            onPress={onClose}
                            style={styles.closeButtonStyle}
                        />
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.BACKGROUND,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
        paddingTop: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(224, 195, 108, 0.2)',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.MAIN,
        flex: 1,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(224, 195, 108, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeIcon: {
        fontSize: 20,
        color: COLORS.SECOND,
        fontWeight: 'bold',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
    },
    content: {
        fontSize: 15,
        color: COLORS.SECOND,
        lineHeight: 24,
        textAlign: 'left',
    },
    footer: {
        padding: 24,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(224, 195, 108, 0.2)',
    },
    closeButtonStyle: {
        backgroundColor: COLORS.MAIN,
    },
});

export default TermsModal;

