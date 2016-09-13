/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import PubNub from 'pubnub';
import {
  AppRegistry,
  StyleSheet,
  View,
} from 'react-native';
import MapView from 'react-native-maps';
const styles = StyleSheet.create({
  container : {
    ...StyleSheet.absoluteFillObject,
    height         : 400,
    width          : 400,
    justifyContent : 'flex-end',
    alignItems     : 'center',
  },
  map : {
    ...StyleSheet.absoluteFillObject,
  },
});

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);// deg2rad below
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

class CarObserverApp extends Component {
  constructor () {
    super();
    navigator.geolocation.watchPosition(
      ({ coords : {latitude, longitude}}) => {
        console.warn('watchPosition');
        this.setState({
          person : {
            latitude,
            longitude,
          },
        });
        const delta = (getDistanceFromLatLonInKm(
          this.state.car.latitude,
          this.state.car.longitude,
          latitude,
          longitude,
        ) * 0.621371) / 30;
        this.setState({
          person : {
            latitude,
            longitude,
          },
          delta,
        });
      },
      (error) => {
        console.warn(error);
      });
    const pubnub = new PubNub({
      ssl          : true,
      publishKey   : 'pub-c-53eaf64c-9df8-4ca7-9116-9ecb0d61feef',
      subscribeKey : 'sub-c-b507301c-216b-11e6-8b91-02ee2ddab7fe',
    });
    pubnub.subscribe({
      channels : ['carobserver:position'],
    });
    pubnub.subscribe({
      channels : ['carobserver:position'],
    });
    pubnub.addListener({
      message : (m) => {
        const delta = (getDistanceFromLatLonInKm(
          this.state.person.latitude,
          this.state.person.longitude,
          m.message[0],
          m.message[1],
        ) * 0.621371) / 30;
        this.setState({
          car : {
            latitude  : m.message[0],
            longitude : m.message[1],
          },
          intermediate : {
            latitude  : (this.state.person.latitude + m.message[0]) / 2,
            longitude : (this.state.person.longitude + m.message[1]) / 2,
          },
          delta,
        });
      },
      status : (s) => {
        console.warn(JSON.stringify(s));
      },
    });

    this.state = {
      car : {
        latitude  : 37.78825,
        longitude : -122.4324,
      },
      intermediate : {
        latitude  : 37.78825,
        longitude : -122.4324,
      },
      person : {
        latitude  : 37.78825,
        longitude : -122.4324,
      },
      delta : 0.4,
    };
  }
  onPress = (coord) => {
    this.setState({
      person : coord.nativeEvent.coordinate,
    });
    setTimeout(() => {
      const delta = (getDistanceFromLatLonInKm(
        this.state.person.latitude,
        this.state.person.longitude,
        this.state.car.latitude,
        this.state.car.longitude,
      ) * 0.621371) / 30;
      console.warn(delta);
      this.setState({
        intermediate : {
          latitude  : (this.state.person.latitude + this.state.car.latitude) / 2,
          longitude : (this.state.person.longitude + this.state.car.longitude) / 2,
        },
        delta,
      });
    }, 150);
  }
  render () {
    return (
      <View style ={styles.container}>
        <MapView style={styles.map} region={{
          ...this.state.intermediate,
          latitudeDelta  : this.state.delta,
          longitudeDelta : this.state.delta,
        }} onLongPress={this.onPress}
        scrollEnabled={false}
        >
          <MapView.Marker
            coordinate={this.state.car}
            title="Carro"
          />
          <MapView.Marker
            coordinate={this.state.person}
            title="Person"
          />
          <MapView.Marker
            coordinate={this.state.intermediate}
            title="Int"
          />
        </MapView>
      </View>
    );
  }
}

AppRegistry.registerComponent('CarObserverApp', () => CarObserverApp);
