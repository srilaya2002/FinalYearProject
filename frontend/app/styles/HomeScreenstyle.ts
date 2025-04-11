import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingTop: 50,
        paddingBottom: 40, // add bottom space so scroll feels smooth
        paddingHorizontal: 20,
        backgroundColor: '#ffffff',
      },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  cardList: {
    width: '100%',
    marginTop: 10,
  },
  card: {
    borderRadius: 16,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  cardText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  cardIcon: {
    fontSize: 28,
  },
  
  cardSubText: {
    fontSize: 15,
    marginTop: 4,
    color: '#444',
  },
  
  cardReasonText: {
    fontSize: 14,
    marginTop: 6,
    flexShrink: 1,  
    flexWrap: 'wrap', 
  },
  signOutButton: {
    position: 'absolute',   
    top: 10,            
    right: 20,              
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    zIndex: 1,             
  },
  signOutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color:'#000000',
  },
});

export default styles;
