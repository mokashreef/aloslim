import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  final http.Client _client = http.Client();
  final Duration _timeout = const Duration(seconds: 15);

  /// Generic GET request with error handling
  Future<dynamic> get(String url) async {
    try {
      final response = await _client
          .get(Uri.parse(url))
          .timeout(_timeout);

      if (response.statusCode == 200) {
        return json.decode(utf8.decode(response.bodyBytes));
      } else {
        throw ApiException(
          'فشل في تحميل البيانات',
          statusCode: response.statusCode,
        );
      }
    } on Exception catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('خطأ في الاتصال: ${e.toString()}');
    }
  }

  /// GET request that returns raw response body
  Future<String> getRaw(String url) async {
    try {
      final response = await _client
          .get(Uri.parse(url))
          .timeout(_timeout);

      if (response.statusCode == 200) {
        return utf8.decode(response.bodyBytes);
      } else {
        throw ApiException(
          'فشل في تحميل البيانات',
          statusCode: response.statusCode,
        );
      }
    } on Exception catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('خطأ في الاتصال: ${e.toString()}');
    }
  }

  void dispose() {
    _client.close();
  }
}

class ApiException implements Exception {
  final String message;
  final int? statusCode;

  ApiException(this.message, {this.statusCode});

  @override
  String toString() => 'ApiException: $message (status: $statusCode)';
}
